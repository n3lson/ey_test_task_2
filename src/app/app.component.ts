import {Component, OnInit} from '@angular/core';
import {ExcelParserService} from './service/excel-parser.service';
import {HttpService} from './service/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  files: string[] = null;
  fileData = null;

  constructor(private xlsService: ExcelParserService, private http: HttpService) {}

  ngOnInit(): void {
  }

  post(data, j, classId, fileId) {
    this.http.postAccount({value: data.account[j], fileId: fileId})
      .subscribe(accountId => {
        this.http.postOpeningBalance({
          asset: data.openingBalanceAsset[j],
          passive: data.openingBalancePassive[j],
          classId: classId,
          accountId: accountId,
          fileId: fileId
        }).subscribe();

        this.http.postRevs({
          debit: data.revsDebit[j],
          credit: data.revsCredit[j],
          classId: classId,
          accountId: accountId,
          fileId: fileId
        }).subscribe();

        this.http.postClosingBalance({
          asset: data.closingBalanceAsset[j],
          passive: data.closingBalancePassive[j],
          classId: classId,
          accountId: accountId,
          fileId: fileId
        }).subscribe();
      });
  }

   postXLS($event): void {
    this.xlsService.read($event.target.files[0]);
    this.xlsService.getParsedData().subscribe(data => {
      this.http.postFile($event.target.files[0].name)
               .subscribe(fileId => {
                 for (let i = 0; i < data.classes.length; ++i) {
                   this.http.postClass({title: data.classes[i].title, fileId: fileId})
                            .subscribe(classId => {
                              if ((i + 1) < data.classes.length) {
                                for (let j = data.classes[i].index; j < data.classes[i + 1].index; ++j) {
                                  this.post(data, j, classId, fileId);
                                }
                              } else {
                                for (let j = data.classes[i].index; j < data.account.length; ++j) {
                                  this.post(data, j, classId, fileId);
                                }
                              }
                            });
                 }
               }
      );
    });
  }

  getFiles() {
    this.http.getFiles().subscribe((files: string[]) => this.files = files);
  }

  getDataFromFile(filename: string) {
    this.http.getDataFromFile(filename).subscribe(fileData => this.fileData = fileData);
  }
}
