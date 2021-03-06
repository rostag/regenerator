import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getRandomWordOfGivenLength, latynize } from 'src/modules/generator/generator-helpers';
import { Rhyme, Rhymes, rhymes } from '../models/rythm.models';
import { Dictionary, Line, Poetry, PoetryService, Strophae, Word } from '../services/poetry.service';

/*
  pyro / senkan
  я бог 
  ты бросая 
  сукой волосами 
  красным которые лона 
  меня 
*/

@Component({
  selector: 'app-poetry',
  templateUrl: './poetry.component.html',
  styleUrls: ['./poetry.component.scss']
})
export class PoetryComponent implements OnInit {

  rhymeControl = new FormControl();
  dictionaryControl = new FormControl();
  latynizeControl = new FormControl(true);

  dictionaries: Dictionary[];
  dictionary: Dictionary;

  rhymes: Rhymes;
  rhyme: Rhyme;

  poetry: string = '';
  oOPoetry: Poetry = null;

  constructor(private poetryService: PoetryService) {
    this.poetryService.setupDictionaries();
    this.dictionaries = this.poetryService.dictionaries;
    this.dictionary = this.dictionaries[0];
  }

  public onDictionarySelection(d: Dictionary) {
    this.dictionary = d;
    this.generate();
  }

  public onRhymeSelection(rhyme: Rhyme) {
    this.setRhyme(rhyme);
    this.generate();
  }

  public reSlovo() {
    this.generate();
  }

  public reStyle() {
    this.generate();
  }

  public getDictionaries(): Dictionary[] {
    return Object['values'](this.dictionaries);
  }

  public getRhymes(): Rhyme[] {
    return Object['values'](this.rhymes);
  }

  public ngOnInit() {
    this.dictionaryControl.valueChanges.pipe().subscribe(val => this.onDictionarySelection(val));
    this.rhymeControl.valueChanges.pipe().subscribe(val => this.onRhymeSelection(val));
    this.latynizeControl.valueChanges.pipe().subscribe(val => this.generate())

    this.rhymes = rhymes;
    this.setRhyme(this.rhymes.haiku);

    this.generate();
  }

  public setDictionary(dic: Dictionary) {
    this.dictionary = dic;
  }

  public setRhyme(rhyme: Rhyme) {
    this.rhyme = rhyme;
  }

  public generate() {
    this.copyText();
    this.oOPoetry = this.getOPoetryObjectFromDicAndRythm();
  }

  public getPoetryStringFromDicAndRythm(): string {
    let result = '';
    this.rhyme.value.forEach(line => {
      line.forEach(wordLength => {
        const newWord = getRandomWordOfGivenLength(this.dictionary.words, wordLength, false, false);
        result += newWord.wordContents + ' ';
      })
      result += '\n';
    })
    return result;
  };

  public getOPoetryObjectFromDicAndRythm(): Poetry {
    const oopo: Poetry = {
      strophae: [{
        lines: [{
          words: []
        }]
      }]
    };
    let lines: Line[] = [];
    this.rhyme.value.forEach(rhymeLine => {
      let words: Word[] = [];
      rhymeLine.forEach(wordLength => {
        const newWord = getRandomWordOfGivenLength(this.dictionary.words, wordLength, false, false);
        words = words.concat(newWord);
      })
      lines.push({
        words: words
      });
    })
    oopo.strophae[0].lines = lines;
    return oopo;
  };

  public copyText() {
    let val = '';
    if (!(this.oOPoetry && this.oOPoetry.strophae) ) {
      return;
    }
    this.oOPoetry.strophae.forEach(strophae => strophae.lines.forEach(line => {
      line.words.forEach(word => {
        val += this.postProcess(word) + ' ';
      });
      val += '\n';
    }));

    const today = new Date().toDateString();
    const framework = this.dictionary.name + ' / ' + this.rhyme.name;
    const selBox = document.createElement('textarea');

    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = `${framework} - ${today} \n\n${val} \n* * *\n\n`;

    document.body.appendChild(selBox);

    selBox.focus();
    selBox.select();

    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  reword(words: Word[], word: Word, event: MouseEvent): void {
    const newWord = getRandomWordOfGivenLength(this.dictionary.words, word.rhymeWordLength);
    const index = words.indexOf(word);
    words[index] = newWord;
    event.stopPropagation();
  }
  reline(lines: Line[], line: Line, event): void {
    line.words.forEach((word, index, words) => {
      words[index] = getRandomWordOfGivenLength(this.dictionary.words, word.rhymeWordLength)
    })
    event.stopPropagation();
  }

  postProcess(word: Word): string {
    return this.latynizeControl.value ? latynize(word.wordContents) : word.wordContents;
  }

  getDictionaryFromTextarea(evt) {
    console.log('e: ', evt.target.value); 
    this.poetryService.createDictionaryFromSource({name: 'text', value: evt.target.value});
    this.dictionaries = this.poetryService.dictionaries;
  }
}
