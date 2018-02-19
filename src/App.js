import React, { Component } from 'react';
import pos from 'pos';
import Unsplash, { toJson }  from 'unsplash-js';

import data from './data.js';
import './main.css';

// const authCode = 'e8f61d320c01d0989885dffbcfe286ac31c292cc2ca026c5080600c7c11c27c0';
const UNSPLASH_ID = '926c4934bdf3971f3a6dc01076c8e78bb264a532855d7f1d4ce98cecc2f6f53e';
const UNSPLASH_KEY = 'ea24e52e6fe937b82e5275dadafb3d30c814dc17f91ee3ccd6b70a14373c6a69';
const UNSPLASH_CALLBACK_URL = 'urn:ietf:wg:oauth:2.0:oob';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      background: '',
    };

    this.mainNouns = ['NN', 'NNS', 'NNP'];
    this.unsplash = new Unsplash({
      applicationId: UNSPLASH_ID,
      secret: UNSPLASH_KEY,
      callbackUrl: UNSPLASH_CALLBACK_URL
    });
    this.random = (max) => {
      const min = 0;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  componentDidMount() {
    const factOfTimeIndex = this.random(data.length - 1);
    const selectedFact = data[factOfTimeIndex];

    const words = new pos.Lexer().lex(selectedFact);
    const tagger = new pos.Tagger();

    const taggedWords = tagger.tag(words);
    const filteredNoun = taggedWords.filter(item => this.mainNouns.indexOf(item[1]) > -1 && item[0].length > 1) || [];
    let NNPWords = filteredNoun.filter(item=>item[1]==='NNP');
    let NNWords = filteredNoun.filter(item=>item[1]==='NN');
    let NNSWords = filteredNoun.filter(item=>item[1]==='NNS');

    NNPWords = NNPWords.map(item => item[0].toLowerCase());
    NNWords = NNWords.map(item => item[0].toLowerCase());
    NNSWords = NNSWords.map(item => item[0].toLowerCase());

    console.log('NNPWords : ', NNPWords)
    console.log('NNWords : ', NNWords)
    console.log('NNSWords : ', NNSWords)

    NNPWords = NNPWords[this.random(NNPWords.length - 1)] || '';
    NNWords = NNWords[this.random(NNWords.length - 1)] || '';
    NNSWords = NNSWords[this.random(NNSWords.length - 1)] || '';

    let mainNouns = Object.assign([], [NNPWords,NNWords,NNSWords].filter(item=>!!item));
    // No duplicates
    mainNouns = new Set(mainNouns);
    //Remove 'have' is'nt noun
    mainNouns.delete('have');
    mainNouns = [...mainNouns].join(' ');
    console.log('Noun : ', mainNouns);
    this.unsplash.search.photos(mainNouns, 1, 1)
        .then(toJson).then(item => {
      const mainImage = item.results[0];
      const preLoadImage = new Image();
      preLoadImage.onload = () => {
        this.setState({
          isBlur: false,
          background: mainImage.urls.regular,
        })
      };
      preLoadImage.src = mainImage.urls.regular;
      this.setState({
        isBlur: true,
        background: mainImage.urls.thumb,
        fact: selectedFact
      })
    }).catch(err=>err);
  }

  render() {
    return (
      <div className="App">
        <img alt={this.state.fact}
             className={`background ${this.state.isBlur?'blur_background':''}`}
             src={this.state.background}/>
        <p>{this.state.fact}</p>
        <small>Website cooking...ready soon.</small>
      </div>
    );
  }
}

export default App;
