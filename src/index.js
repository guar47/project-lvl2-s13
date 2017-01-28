import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import selectParser from './parsers';
import format from './formatters';

const getExtFile = file => path.extname(file).replace('.', '');

const getDiff = (firstData, secondData) => {
  const keys = _.union(_.keys(firstData), _.keys(secondData));
  const resultMap = keys.map((key) => {
    if (firstData[key] === secondData[key]) {
      return { name: key, value: firstData[key], action: 'equal' };
    } else if (_.isObject(firstData[key]) && _.isObject(secondData[key])) {
      return { name: key, value: getDiff(firstData[key], secondData[key]), action: 'equal' };
    } else if (_.isUndefined(firstData[key])) {
      return { name: key, value: secondData[key], action: 'added' };
    } else if (_.isUndefined(secondData[key])) {
      return { name: key, value: firstData[key], action: 'removed' };
    } return [{ name: key, value: firstData[key], action: 'changedFrom' }, { name: key, value: secondData[key], action: 'changedTo' }];
  });
  return _.flatten(resultMap);
};

const diffFiles = (firstFile, secondFile, type = 'json') => {
  const sourceDataFirst = selectParser(getExtFile(firstFile))(fs.readFileSync(firstFile, 'utf8'));
  const sourceDataSecond = selectParser(getExtFile(secondFile))(fs.readFileSync(secondFile, 'utf8'));
  return format(type)(getDiff(sourceDataFirst, sourceDataSecond));
};

export default diffFiles;
