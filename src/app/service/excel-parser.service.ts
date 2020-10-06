import {Injectable} from '@angular/core';
import * as XLSX from 'ts-xlsx';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelParserService {
  data = new Subject<any>();
  rows: any[] = [];

  classes: {index: number, title: string}[] = [];
  account: number[] = [];

  openingBalanceAsset: number[] = [];
  openingBalancePassive: number[] = [];

  revsDebit: number[] = [];
  revsCredit: number[] = [];

  closingBalanceAsset: number[] = [];
  closingBalancePassive: number[] = [];

  readonly COMA = ',';
  readonly EMPTY = '';
  readonly ACCOUNT = 'Б/сч';

  constructor() {}

  /* For unknown reasons numbers
  *  read from the excel file contain comas
  *  (for example: 700,999,999.32, which is actually a 700999999.32).
  *  This method gets rid of these comas.
  * */
  private parseFloat(str: string): number {
    while(str.includes(this.COMA)) {
      str = str.replace(this.COMA, this.EMPTY);
    }
    return parseFloat(str);
  }

  private parse(): void {
    // If a 2D array of cells is empty
    if (this.rows.length === 0) {
      return;
    }

    // Start from the beginning of the array.
    let startIndex = 0;
    let i = startIndex;

    // Look for a 'Б/сч' string in the first element of a row.
    for (; i < this.rows.length; ++i) {
      // startIndex is the first index of the table in the file.
      if (this.rows[i][0].includes(this.ACCOUNT)) {
        startIndex = i;
        break;
      }
    }

    // The first piece of data is 2 rows below the fields names.
    startIndex += 2;

    // Go through all the rows.
    for (i = startIndex; i < this.rows.length; ++i) {
      // If the current row length is equal to 1 then this row consists of 1 cell and this cell contains the class name.
      if (this.rows[i].length == 1) {
        // Push the class name.
        this.classes.push({index: this.account.length, title: this.rows[i][0]});
      } else {
        /*
        * The first cell in a row is a balance number. Sometimes the first cell contains summary
        * by the current class. This information is ignored due to simple ability of counting such
        * kind of summary by SQL queries. So the field is parsed to integer number.
        * */
        let balance = parseInt(this.rows[i][0]);

        // And if the field is not a number than it is a summary by class and has to be ignored.
        if (isNaN(balance)) {
          continue;
        }

        // Push fields values.
        this.account.push(balance);

        this.openingBalanceAsset.push(this.parseFloat(this.rows[i][1]));
        this.openingBalancePassive.push(this.parseFloat(this.rows[i][2]));

        this.revsDebit.push(this.parseFloat(this.rows[i][3]));
        this.revsCredit.push(this.parseFloat(this.rows[i][4]));

        this.closingBalanceAsset.push(this.parseFloat(this.rows[i][5]));
        this.closingBalancePassive.push(this.parseFloat(this.rows[i][6]));
      }
    }

    // Clear the buffer of rows.
    this.rows = [];

    // Push an object of parsed fields to the Subject instance.
    this.data.next(
      {
        classes: this.classes,
        account: this.account,
        openingBalanceAsset: this.openingBalanceAsset,
        openingBalancePassive: this.openingBalancePassive,
        revsDebit: this.revsDebit,
        revsCredit: this.revsCredit,
        closingBalanceAsset: this.closingBalanceAsset,
        closingBalancePassive: this.closingBalancePassive
      }
    );
  }

  // Read an excel file and parses its data by calling this.parse.
  public read(file: Blob): void {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      // Read file.
      const wb: XLSX.IWorkBook = XLSX.read(event.target.result, {type: 'binary'});
      // Get a work sheet from the file.
      const ws = wb.Sheets[wb.SheetNames[0]];
      // Get a 2D array that represents data in every cell of the work sheet.
      this.rows = XLSX.utils.sheet_to_json(ws, {header: 1});
      this.parse();
    };
  }

  // Return an asynchronous object of data that is going to be parsed.
  public getParsedData(): any {
    return this.data.asObservable();
  }
}
