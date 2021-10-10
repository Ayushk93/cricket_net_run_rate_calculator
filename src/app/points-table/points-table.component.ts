import { Component, OnInit, ɵisDefaultChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-points-table',
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss']
})
export class PointsTableComponent implements OnInit {

  pointsTableHeader = ['#', 'Team', 'Matches', 'Won', 'Lost', 'NRR', 'For', 'Against', 'Pts'];
  pointsTableData: any = [];
  maxOver = 20;
  treacherousAgainstRagnarok = {
    batFirst: { runs: 120, overs: 20 },
    bowlFirst: { runs: 119, overs: 20 }
  };
  treacherousAgainstBhayankar = {
    batFirst: { runs: 80, overs: 20 },
    bowlFirst: { runs: 79, overs: 20 }
  };
  RagnarokStarsNRR = 0.319;
  TreacherousNRR = 0.331;
  scenarioCalculated = false;
  answer1 = '';
  answer2 = '';
  treacherousFor = { runs: 1066, overs: 128.2 };
  treacherousAgainst = { runs: 1094, overs: 137.1 };
  scenario1 = '';
  scenario2 = '';
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.httpClient.get("assets/pointsTable.json").subscribe(data => {
      console.log(data);
      this.pointsTableData = data;
    })
  }

  //below function is used for selection of appropriate values based on team selection 
  nrrCalculationBasedOnTeamSelection(event: any) {
    this.scenarioCalculated = false;
    const selectedTeam = event.target.value;
    if (this.RagnarokStarsNRR < this.TreacherousNRR) {
      if (selectedTeam === 'RAGNAROK') {
        this.scenario1 = 'Q-1a:';
        const batSecondRestrict1 = this.randomScoreAndOverGenerator(this.treacherousAgainstRagnarok.batFirst.runs, this.treacherousAgainstRagnarok.batFirst.runs / 2);
        const batSecondRestrict2 = this.randomScoreAndOverGenerator(this.treacherousAgainstRagnarok.batFirst.runs, batSecondRestrict1);
        const batSecondRestrictOvers = this.randomScoreAndOverGenerator(20, 15);
        const nrrUptoBowl = this.nrrCalculator(this.treacherousAgainstRagnarok.batFirst, batSecondRestrict1, batSecondRestrictOvers, 0);
        const nrrFromBowl = this.nrrCalculator(this.treacherousAgainstRagnarok.batFirst, batSecondRestrict2, batSecondRestrictOvers, 0);

        this.answer1 = `If Treacherous score ${this.treacherousAgainstRagnarok.batFirst.runs} runs in 
          ${this.treacherousAgainstRagnarok.batFirst.overs} overs, Treacherous needs to restrict
          RAGNAROK STARS between ${batSecondRestrict1} to ${batSecondRestrict2} runs in ${batSecondRestrictOvers}.
          Revised NRR of Treacherous will be between ${nrrFromBowl} to ${nrrUptoBowl}.`;
        
        this.scenario2 = 'Q-1b:';
        const batSecondAchieveOvers1 = this.randomScoreAndOverGenerator(20, 12);
        const batSecondAchieveOvers2 = this.randomScoreAndOverGenerator(batSecondAchieveOvers1, 20);
        const nrrUptoBat = this.nrrCalculator(this.treacherousAgainstRagnarok.bowlFirst, this.treacherousAgainstRagnarok.bowlFirst.runs, batSecondAchieveOvers1, 1);
        const nrrFromBat = this.nrrCalculator(this.treacherousAgainstRagnarok.bowlFirst, this.treacherousAgainstRagnarok.bowlFirst.runs, batSecondAchieveOvers2, 1);
        this.answer2 = `Treacherous need to chase ${this.treacherousAgainstRagnarok.bowlFirst.runs + 1} runs between 
          ${batSecondAchieveOvers1} to ${batSecondAchieveOvers2} Overs. Revised NRR for Treacherous will be 
          between ${nrrUptoBat} to ${nrrFromBat}.`
      }
      else {
        this.scenario1 = 'Q-2a:';
        const batSecondRestrict1 = this.randomScoreAndOverGenerator(this.treacherousAgainstBhayankar.batFirst.runs, this.treacherousAgainstBhayankar.batFirst.runs / 2);
        const batSecondRestrict2 = this.randomScoreAndOverGenerator(this.treacherousAgainstBhayankar.batFirst.runs, batSecondRestrict1);
        const batSecondRestrictOvers = this.randomScoreAndOverGenerator(20, 15);
        const nrrUptoBowl = this.nrrCalculator(this.treacherousAgainstBhayankar.batFirst, batSecondRestrict1, batSecondRestrictOvers, 0);
        const nrrFromBowl = this.nrrCalculator(this.treacherousAgainstBhayankar.batFirst, batSecondRestrict2, batSecondRestrictOvers, 0);
        this.answer1 = `If Treacherous scores ${this.treacherousAgainstBhayankar.batFirst.runs} runs in ${this.treacherousAgainstBhayankar.batFirst.overs} overs,
        Treacherous needs to restrict BHAYANKAR XI 
          between ${batSecondRestrict1} to ${batSecondRestrict2} runs in ${batSecondRestrictOvers}. Revised NRR of Treacherous will be between ${nrrFromBowl} to ${nrrUptoBowl}.`;

        this.scenario2 = 'Q-2b:';
        const batSecondAchieveOvers1 = this.randomScoreAndOverGenerator(20, 12);
        const batSecondAchieveOvers2 = this.randomScoreAndOverGenerator(batSecondAchieveOvers1, 20);
        const nrrUptoBat = this.nrrCalculator(this.treacherousAgainstBhayankar.bowlFirst, this.treacherousAgainstBhayankar.bowlFirst.runs, batSecondAchieveOvers1, 1);
        const nrrFromBat = this.nrrCalculator(this.treacherousAgainstBhayankar.bowlFirst, this.treacherousAgainstBhayankar.bowlFirst.runs, batSecondAchieveOvers2, 1);
        this.answer2 = `Treacherous needs to chase ${this.treacherousAgainstBhayankar.bowlFirst.runs + 1} between ${batSecondAchieveOvers1} to ${batSecondAchieveOvers2} Overs.
          Revised NRR for Treacherous will be between ${nrrUptoBat} to ${nrrFromBat}.`;
      }
    }
    this.scenarioCalculated = true;
  }

  //below function is used for nrr calculation based on run scored conceded by team and overs bowled
  nrrCalculator(batFirst: any, runsScroed: any, oversBowled: any, chase: number) {
    const forTotal = (this.treacherousFor.runs + batFirst.runs) / (this.treacherousFor.overs + batFirst.overs);
    const againstTotal = (this.treacherousAgainst.runs + runsScroed) / (this.treacherousAgainst.overs + oversBowled);
    return ((forTotal - againstTotal) + this.TreacherousNRR).toFixed(3);
  }

  //below function is used for random over and score generation based on given range
  randomScoreAndOverGenerator(max: number, min: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
