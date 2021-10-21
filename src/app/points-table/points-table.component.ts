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
    playingTeam: new FormControl("", Validators.required),
    oppositionTeam: new FormControl("", Validators.required),
    overs: new FormControl("", Validators.required),
    position: new FormControl("", Validators.required),
    battingBowling: new FormControl("", Validators.required),
    runsToScore: new FormControl("", Validators.required),
  });
  isFormSubmitted = false;
  answer = '';
  mainTeamSelected = '';
  displayOtherFields = false;
  currentPosition = 0;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.httpClient.get("http://localhost:3000/pointsTable").subscribe(data => { //http://localhost:3000
      console.log(data);
      this.pointsTableData = data;
    })
  }
//https://glossy-certain-warlock.glitch.me/pointsTable
  //below function is used for selection of appropriate values based on team selection 
  onSubmit() {
    const userInput = this.calculatorForm.value;
    let [runsScored, oversFaced] = [...userInput.playingTeam.For.split("/")];
    let [runsConceded, oversBowled] = [...userInput.playingTeam.Against.split("/")];
    let [runsScoredOpp, oversFacedOpp] = [...userInput.oppositionTeam.For.split("/")];
    let [runsConcededOpp, oversBowledOpp] = [...userInput.oppositionTeam.Against.split("/")];
    console.log(this.calculatorForm.value);
    runsScored = userInput.battingBowling === 'Yes' ? Number(runsScored) + userInput.runsToScore 
                          : Number(runsScored) + userInput.runsToScore + 1;
    runsConceded = userInput.battingBowling === 'No' ? Number(runsConceded) + userInput.runsToScore 
                          : Number(runsConceded) + userInput.runsToScore - 1;
    runsScoredOpp = userInput.battingBowling === 'No' ? Number(runsScoredOpp) + userInput.runsToScore 
                          : Number(runsScoredOpp) + userInput.runsToScore + 1;
    runsConcededOpp = userInput.battingBowling === 'Yes' ? Number(runsConcededOpp) + userInput.runsToScore 
                          : Number(runsConcededOpp) + userInput.runsToScore - 1;
    oversFaced = this.overCalculation(oversFaced, (userInput.overs).toString());
    oversFacedOpp = this.overCalculation(oversFacedOpp, (userInput.overs).toString());
    oversBowled = this.overCalculation(oversBowled, (userInput.overs).toString());
    oversBowledOpp = this.overCalculation(oversBowledOpp, (userInput.overs).toString());
    console.log('runsScored, oversFaced', runsScored, oversFaced, this.pointsTableData[userInput.position - 1].NRR);
    console.log('runsConceded, oversBowled', runsConceded, oversBowled);
    console.log('runsScoredOpp, oversFacedOpp', runsScoredOpp, oversFacedOpp);
    console.log('runsConcededOpp, oversBowledOpp', runsConcededOpp, oversBowledOpp, userInput.oppositionTeam.NRR);
    const nrr1 = Number(this.nrrCalculator(runsScored, runsConceded, oversFaced, oversBowled));
    let opNrr = userInput.oppositionTeam.NRR;
    let nrr2 = 0;
    if(userInput.battingBowling === 'Yes') {
      let temprunsConceded = runsConceded;
      let temprunsScored = runsScoredOpp;
      while (true) {
        temprunsConceded--;
        temprunsScored--;
        nrr2 = Number(this.nrrCalculator(runsScored, temprunsConceded, oversFaced, oversBowled));
        opNrr = Number(this.nrrCalculator(temprunsScored, runsConcededOpp, oversFaced, oversBowled));
        console.log(temprunsConceded, nrr2.toFixed(3), temprunsScored, opNrr);
        if (nrr2 < opNrr && nrr2 > this.pointsTableData[userInput.position - 1].NRR) { // 
          break
        }
      }

    }
    this.answer = `New NRR of ${userInput.playingTeam.Team} will be ${nrr1.toFixed(3)}`;
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
    } 
    if (event.target.value.includes('.')) {
      if (event.key > '6') {
        event.preventDefault();
      }
      const overs = event.target.value.split(".")[1];
      if (overs.length < 2) {
        event.preventDefault();
      }
    }
     else if (!pattern.includes(event.key) || (event.target.value.includes('0') && event.key === '0')) {
      event.preventDefault();
    }
  }

  runsValidator(event: any) {
    const pattern = '0123456789';
    if (!pattern.includes(event.key) || event.target.value.length === 4 || (event.key === '0' && event.target.value.length === 0)) {
      event.preventDefault();
    }
  }


  resetTheForm() {
    this.calculatorForm.reset();
    this.displayOtherFields = false;
    this.answer = '';
    this.isFormSubmitted = false;
    this.mainTeamSelected = '';
  }

  playingTeamSelected(event: any) {
    this.mainTeamSelected = '';
    console.log(this.calculatorForm.value.playingTeam.Team);
    if (this.calculatorForm.value.playingTeam && this.calculatorForm.value.playingTeam.Team) {
      this.mainTeamSelected = this.calculatorForm.value.playingTeam.Team;
      this.currentPosition = this.calculatorForm.value.playingTeam['#'];
      this.displayOtherFields = true;
    }
  }
}
