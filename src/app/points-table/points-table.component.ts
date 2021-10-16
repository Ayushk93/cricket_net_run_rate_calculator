import { Component, OnInit, ɵisDefaultChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormGroup, FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'app-points-table',
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss']
})
export class PointsTableComponent implements OnInit {

  pointsTableHeader = ['#', 'Team', 'Matches', 'Won', 'Lost', 'NRR', 'For', 'Against', 'Pts'];
  pointsTableData: any = [];
  calculatorForm = new FormGroup({
    teamDetails: new FormControl("", Validators.required),
    runsScored: new FormControl("", Validators.required),
    oversFaced: new FormControl("", Validators.required),
    runsConceded: new FormControl("", Validators.required),
    oversBowled: new FormControl("", Validators.required),
  });
  isFormSubmitted = false;
  answer = '';

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.httpClient.get("https://glossy-certain-warlock.glitch.me/pointsTable").subscribe(data => { //http://localhost:3000/
      console.log(data);
      this.pointsTableData = data;
    })
  }

  //below function is used for selection of appropriate values based on team selection 
  onSubmit() {
    const userInput = this.calculatorForm.value;
    let [runsScored, oversFaced] = [...userInput.teamDetails.For.split("/")];
    let [runsConceded, oversBowled] = [...userInput.teamDetails.Against.split("/")];
    console.log(this.calculatorForm.value);
    console.log('runsScored, oversFaced', runsScored, oversFaced);
    console.log('runsConceded, oversBowled', runsConceded, oversBowled);
    runsScored = Number(runsScored) + userInput.runsScored;
    runsConceded = Number(runsConceded) + userInput.runsConceded;
    oversFaced = this.overCalculation(oversFaced, (userInput.oversFaced).toString());
    oversBowled = this.overCalculation(oversBowled, (userInput.oversBowled).toString());
    const nrr = Number(this.nrrCalculator(runsScored, runsConceded, oversFaced, oversBowled));
    this.answer = `New NRR of ${userInput.teamDetails.Team} will be ${nrr.toFixed(3)}`;
    this.isFormSubmitted = true;
  }

  overCalculation(oldOversInput: string, newOversInput: string): string {
    if(oldOversInput.includes(".") && newOversInput.includes(".")) {
      let oldOvers = oldOversInput.split(".");
      let oldOversNum = (Number(oldOvers[0]) * 6) + Number(oldOvers[1]);
      let newOvers = newOversInput.split(".");
      let newOversNum = (Number(newOvers[0]) * 6) + Number(newOvers[1]);
      return ((Math.floor((oldOversNum + newOversNum) / 6)).toString() + '.' + ((oldOversNum + newOversNum) % 6))
    } else {
      return (Number(oldOversInput) + Number(newOversInput)).toString();
    }
  }

  nrrCalculator(runsScored: number, runsConceded: number, oversFaced: string, oversBowled: string): string {
    if (oversFaced.includes(".") && oversBowled.includes(".")) {
      const oversFacedData = oversFaced.split(".");
      const oversBowledData = oversBowled.split(".");
      return ((runsScored/(Number(oversFacedData[0]) + (Number(oversFacedData[1]) / 6))) - 
                (runsConceded/(Number(oversBowledData[0]) + (Number(oversBowledData[1]) / 6)))).toString();
    } else if (oversFaced.includes(".") && !oversBowled.includes(".")) {
      const oversFacedData = oversFaced.split(".");
      return ((runsScored/(Number(oversFacedData[0]) + (Number(oversFacedData[1]) / 6))) - (runsConceded/Number(oversBowled))).toString();
    } else if (!oversFaced.includes(".") && oversBowled.includes(".")) {
      const oversBowledData = oversBowled.split(".");
      return ((runsScored/Number(oversFaced)) - (runsConceded/(Number(oversBowledData[0]) + (Number(oversBowledData[1]) / 6)))).toString();
    } else if (!oversFaced.includes(".") && !oversBowled.includes(".")) {
      return ((runsScored/Number(oversFaced)) - (runsConceded/Number(oversBowled))).toString();
    } else {
      return '';
    }
  }

  oversValidator(event: any) {
    const pattern = '0123456789.';
    if (event.key === '.' && event.target.value.includes('.')) {
      event.preventDefault();
    } else if (event.target.value.includes('.') && event.key > 6) {
      event.preventDefault();
    } else if (event.target.value.length === 4 || event.target.value === '20' || !pattern.includes(event.key)) {
      event.preventDefault();
    }
  }

  runsValidator(event: any) {
    const pattern = '0123456789';
    if (!pattern.includes(event.key) || event.target.value.length === 4 || (event.key === '0' && event.target.value.length === 0)) {
      event.preventDefault();
    }
  }


  resetTheForm(): void {
    this.calculatorForm.reset();
    this.answer = '';
    this.isFormSubmitted = false;
  }
}
