import React, { Component } from 'react';
import './App.css';
import Chart from './Chart';
import Metrics from './metrics.json';
import Select from 'react-select';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';

const options = [
  { id: "0", name: "0"},
  { id: "1", name: "1"},
  { id: "2", name: "2"},
  { id: "3", name: "3"},
  { id: "4", name: "4"}
];

export default class App extends Component {
  constructor(props){
    super(props);
    //Gestion des erreurs possible dans le jeu de données (on vérifie qu'à chaque instant, toutes les données sont présentes)
    const dataArray = Metrics.filter(e => Object.keys(e).length ===20);
    const errorArray = Metrics.filter(e => Object.keys(e).length <20);
    //On ne teste pas qu'il n'y ait pas de données car nous travaillons directement avec un jeu de données qu'on sait ne pas être vide ou totalement erroné
    //Sinon on testerait la taille de metrics et si jamais il était vide ou que toutes les données étaient erronées on afficherait un message d'erreur au lieu de notre render actuel

    this.state = {
     charts: 1,
     dataArray: dataArray,
     errorArray: errorArray,
     numberOfCharts: 0,
     options: options
    }
  }

  makeComponentList=(num)=>{
    let i=0,arr=[];
    for(;i<num;i++){
        arr.push(<Chart dataArray={this.state.dataArray}  key={i}/>)
    }
    return arr;
  }

  handleChange = selectedOption => {
    this.setState({ numberOfCharts: selectedOption.value });
    this.forceUpdate();
  };

  render() {
    return (
      <div className="appContainer">
        <h3>Ercom Charts</h3>
        <h5>Le jeu de données contient {this.state.errorArray.length} objets dont il manque 1 ou plusieurs données (ces objets sont enlevés du jeu de données analysé) : </h5>
        <div  className="jsonContainer">
          <CardDeck>
            {this.state.errorArray.map((error,i) => { return ( <PrintJson key={i} data={error} /> ); })}
          </CardDeck>
        </div>
        <div className="selectContainer">
          <h5>Choisissez le nombre de graphiques à afficher</h5>
          <Select placeholder = 'Nombre de graphiques à afficher' onChange={this.handleChange}
          options = {
            this.state.options.map((label, index) => {
              return {
                label: label.name,
                value: label.id,
                key: index
              }
          })}/>
        </div>
        {this.makeComponentList(this.state.numberOfCharts)}
      </div>)
  }
}

const PrintJson = ({data}) => (<Card border="danger" style={{ width: '18rem' }}><pre>{JSON.stringify(data, null, 2) }</pre></Card>);
