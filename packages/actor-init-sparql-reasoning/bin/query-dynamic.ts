#!/usr/bin/env node
import { runArgsInProcess } from '@comunica/runner-cli';
import { KeysRdfReason } from '@comunica/bus-rdf-reason';
import { ActionContext } from '@comunica/core';
import { defaultGraph, namedNode, quad, variable } from '@rdfjs/data-model';

runArgsInProcess(`${__dirname}/../`, `${__dirname}/../config/config-default.json`, { context: ActionContext({
  [KeysRdfReason.rules]: 'https://bit.ly/subclass-hylar'
  // [KeysRdfReason.rules]: 'https://gist.githubusercontent.com/jeswr/e914df85df0b3d39cfc42f462770ed87/raw/1460e12f875ee48791f25a06dadf9b52c6edc8bb/hylar'
})});
