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

  // Save account, opening and closing balance and revs to the database. Saves a row of data when called.
  post(data, j, classId, fileId) {
    this.http.postAccount({value: data.account[j], fileId: fileId})
      // When the account is saved, its generated id is thrown to the callback.
      .subscribe(accountId => {
        // Save the whole row of data to the database.
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

  // Is called when an input is clicked.
   postXLS($event): void {
    // The service reads and parses the excel file.
    this.xlsService.read($event.target.files[0]);
     // Send POST request to save the filename to the database when the data is parsed .
    this.xlsService.getParsedData().subscribe(data => {
      this.http.postFile($event.target.files[0].name)
              // When the file is saved, its generated id is thrown to the callback.
               .subscribe(fileId => {
                 // For each class in the excel file...
                 for (let i = 0; i < data.classes.length; ++i) {
                   // Send post request to save the current class.
                   this.http.postClass({title: data.classes[i].title, fileId: fileId})
                     // When the class is saved, its generated id is thrown to the callback.
                            .subscribe(classId => {
                              /*
                              * data.classes[i].index is an index of the cell where this class
                              * was placed in the excel file. While the index is not equal to the
                              * index of the next class, post the data that corresponds to the
                              * current class.
                              * i + 1 is bigger than the amount of classes when i === data.classes.length
                              * which means that the current class is the last in the file and the data
                              * corresponds to the last class and should be posted till its end.
                              * */
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

  // Send GET request to draw the list of files.
  getFiles() {
    this.http.getFiles().subscribe((files: string[]) => this.files = files);
  }

  // Get a table from the file.
  getDataFromFile(filename: string) {
    this.http.getDataFromFile(filename).subscribe(fileData => this.fileData = fileData);
  }
}
