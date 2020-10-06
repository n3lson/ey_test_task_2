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

  private parseFloat(str: string): number {
    while(str.includes(this.COMA)) {
      str = str.replace(this.COMA, this.EMPTY);
    }
    return parseFloat(str);
  }

  private parse(): void {
    if (this.rows.length === 0) {
      return;
    }

    let startIndex = 0;
    let i = startIndex;

    for (; i < this.rows.length; ++i) {
      if (this.rows[i][0].includes(this.ACCOUNT)) {
        startIndex = i;
        break;
      }
    }

    startIndex += 2;

    for (i = startIndex; i < this.rows.length; ++i) {
      if (this.rows[i].length == 1) {
        this.classes.push({index: this.account.length, title: this.rows[i][0]});
      } else {
        let balance = parseInt(this.rows[i][0]);

        if (isNaN(balance)) {
          continue;
        }

        this.account.push(balance);

        this.openingBalanceAsset.push(this.parseFloat(this.rows[i][1]));
        this.openingBalancePassive.push(this.parseFloat(this.rows[i][2]));

        this.revsDebit.push(this.parseFloat(this.rows[i][3]));
        this.revsCredit.push(this.parseFloat(this.rows[i][4]));

        this.closingBalanceAsset.push(this.parseFloat(this.rows[i][5]));
        this.closingBalancePassive.push(this.parseFloat(this.rows[i][6]));
      }
    }
    this.rows = [];
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

  public read(file: Blob): void {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const wb: XLSX.IWorkBook = XLSX.read(event.target.result, {type: 'binary'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      this.rows = XLSX.utils.sheet_to_json(ws, {header: 1});
      this.parse();
    };
  }

  public getParsedData(): any {
    return this.data.asObservable();
  }
}
