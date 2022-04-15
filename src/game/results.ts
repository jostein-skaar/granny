import { Result } from './result.model';

export function getResults(): Result[] {
  let resultList: Result[] = [];
  const resultListString = localStorage.getItem('oldemor-resultater');
  if (resultListString) {
    resultList = JSON.parse(resultListString) as Result[];
  }
  return resultList;
}

export function saveResults(newResult: Result): void {
  if (newResult.timeInMs <= 0) {
    return;
  }
  const resultList = getResults();
  resultList.push(newResult);
  resultList.sort((a, b) => a.timeInMs - b.timeInMs);
  const newResultList = resultList.slice(0, 25);
  localStorage.setItem('oldemor-resultater', JSON.stringify(newResultList));
}

export function timeInMsAsString(timeInMs: number) {
  return `${(timeInMs / 1000).toFixed(2)}`;
}
