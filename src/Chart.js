import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import {Alert} from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';

const labelArray = [
  { id: "files", name: "number of files"},
  { id: "inodes", name: "number of inodes"},
  { id: "recv", name: "network > bytes received (bytes)"},
  { id: "send", name: "network > bytes sended (bytes)"},
  { id: "used", name: "memory usage > used (bytes)"},
  { id: "buff", name: "memory usage > buff (bytes)"},
  { id: "cach", name: "memory usage > cach (bytes)"},
  { id: "free",  name: "memory usage > free (bytes)"},
  { id: "usr", name: "total cpu usage > usr (percentage)"},
  { id: "sys", name: "total cpu usage > sys (percentage)"},
  { id: "idl", name: "total cpu usage > idl (percentage)"},
  { id: "wai", name: "total cpu usage > wai (percentage)"},
  { id: "hiq", name: "total cpu usage > hiq (percentage)"},
  { id: "siq", name: "total cpu usage > siq (percentage)"},
  { id: "read", name: "read bytes on disk"},
  { id: "writ", name: "write bytes on disk"},
  { id: "1m", name: "load average > for last minute (percentage)"},
  { id: "5m", name: "load average > for last 5 minutes (percentage)"},
  { id: "15m", name: "load average > for last 15 minutes (percentage)"}
];

export default class Chart extends Component {

  constructor(props){
    super(props);
    const metrics = this.props.dataArray; //importation des données

    // Gestion des dates et ajouts de l'année
    var prettyDates = this.prettyDate(metrics);
    var dates = metrics.map(function(e) {
      let reggie = /(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
      [, day, month, hours, minutes, seconds] = reggie.exec(e.time),
      d = new Date("2019", month-1, day, hours, minutes, seconds)
      return d.getTime()});
    // Calcul de la date minimum
    const minDate = dates.reduce(function (a, b) { return a < b ? a : b; });
    // Calcul de la date maximum
    const maxDate = dates.reduce(function (a, b) { return a > b ? a : b; });

    this.state = {
      data: {
        labels: prettyDates,
        datasets: [
        {
          label: "Number of files",
          backgroundColor: "rgba(255,0,255,0.75)",
          data: metrics.map(function(e) { return e.files;})
        }]
      },
      minDate: minDate,
      maxDate: maxDate,
      labelArray: labelArray,
      selectedOption: {label: "number of files", value: "files", key: 0},
      metrics: metrics,
      dates: prettyDates,
      errorMinDate: false,
      errorMaxDate: false,
      minValue: 0,
      maxValue: 0,
      averageValue: 0
    }
  }

  componentDidMount(){
    this.calculateMinMaxAndAverageValue(this.state.metrics.map(function(e) { return {value: e.files, time: e.time};}));
  }

  prettyDate = metrics => {
    return metrics.map(function(e) {
      let reggie = /(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
      [, day, month, hours, minutes, seconds] = reggie.exec(e.time),
      d = new Date("2019", month-1, day, hours, minutes, seconds);
      let formatted_date = ("00" + d.getDate()).slice(-2) + "-" +
        ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        d.getFullYear() + " " +
        ("00" + d.getHours()).slice(-2) + ":" +
        ("00" + d.getMinutes()).slice(-2) + ":" +
        ("00" + d.getSeconds()).slice(-2);
      return formatted_date;
    });
  }

  getDateWithYear = date => {
    let reggie = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
    [, day, month, years, hours, minutes, seconds] = reggie.exec(date),
    newDate = new Date(years, month-1, day, hours, minutes, seconds);
    return newDate;
  }

  calculateMinMaxAndAverageValue = metrics => {
    /* Pour une question d'UI/UX nous n'allons afficher que la dernière value minimum ou maximum
       car il y a des graphiques ou la value minimum est souvent à 0 ce qui impacterait énormément
        la visibilité des différents graphiques, de plus ces valeurs sont bien souvent visuellement
        identifiable directement sur le graphique */
    // Calcul de la dernière value minimum
    const minValue = metrics.reduce(function (a, b) { return a.value < b.value ? a : b; });
    // Calcul de la dernière value maximum
    const maxValue = metrics.reduce(function (a, b) { return a.value > b.value ? a : b; });
    // Calcul de la somme puis de l'average value
    const sum = metrics.map(function(e) { return e.value;}).reduce(function(a,b){return a + b;});
    const averageValue = sum / metrics.length;
    // on met les données dans le state
    this.setState({minValue: minValue});
    this.setState({maxValue: maxValue});
    this.setState({averageValue: averageValue});
    this.forceUpdate();
  }

  changeDataToDisplay = selectedOption => {
    this.setState({ selectedOption });
    var datasets = [
    {
      label: selectedOption.label,
      backgroundColor: "rgba(255,0,255,0.75)",
      data: this.state.metrics.map(function(e) { return e[selectedOption.value];})
    }];
    this.setState({ data: {datasets: datasets} });
    this.calculateMinMaxAndAverageValue(this.state.metrics.map(function(e) { return {value: e[selectedOption.value], time: e.time};}));
    this.forceUpdate();
  };

  changeMinDate = selectedOption => {
    let date = this.getDateWithYear(selectedOption.value);
    if(date.getTime() < this.state.maxDate){
      this.setState({errorMinDate: false}); // Gestion affichage erreur
      this.setState({ minDate: date.getTime() });
      const metrics = this.filterByDate(this.state.metrics, date.getTime(), this.state.maxDate);
      var value = this.state.selectedOption.value;
      this.setState({ data: {
          labels: this.prettyDate(metrics),
          datasets: [
          {
            label: this.state.selectedOption.label,
            backgroundColor: "rgba(255,0,255,0.75)",
            data: metrics.map(function(e) { return e[value];})
          }]
        }});
      this.calculateMinMaxAndAverageValue(metrics.map(function(e) { return {value: e[value], time: e.time};}));
    } else {
      this.setState({errorMinDate: true}); // Gestion affichage erreur
    }

  };

  changeMaxDate = selectedOption => {
    let date = this.getDateWithYear(selectedOption.value);
    if(date.getTime() > this.state.minDate){
      this.setState({errorMaxDate: false}); // Gestion affichage erreur
      this.setState({ maxDate: date.getTime() });
      const metrics = this.filterByDate(this.state.metrics, this.state.minDate, date.getTime());
      var value = this.state.selectedOption.value;
      this.setState({ data: {
          labels: this.prettyDate(metrics),
          datasets: [
          {
            label: this.state.selectedOption.label,
            backgroundColor: "rgba(255,0,255,0.75)",
            data: metrics.map(function(e) { return e[value];})
          }]
        }});
      this.calculateMinMaxAndAverageValue(metrics.map(function(e) { return {value: e[value], time: e.time};}));
    } else {
      this.setState({errorMaxDate:true}); // Gestion affichage erreur
    }
  };

  filterByDate = (arr, minDate, maxDate) => {
    var data=[];
    for (var i=0; i<arr.length; i++){
      let reggie = /(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
      [, day, month, hours, minutes, seconds] = reggie.exec(arr[i].time),
      date = new Date("2019", month-1, day, hours, minutes, seconds);
      if((date.getTime()>= minDate) && (date.getTime() <= maxDate)) data.push(arr[i]);
    }
    return data;
  }

  render() {
    const { errorMaxDate } = this.state;
    const { errorMinDate } = this.state;
    const handleDismiss = () => {
      this.setState({ errorMinDate: false });
      this.setState({ errorMaxDate: false });
    }
    return (
      <div className="charts">
        <div className="chart">
          <Select
            options = {
              this.state.labelArray.map((label, index) => {
                return {
                  label: label.name,
                  value: label.id,
                  key: index
                }
            })}
            placeholder = 'Choisissez la donnée à afficher'
            onChange={this.changeDataToDisplay}
          />
        </div>
        <div>
          <div className="chartSelectContainer">
            <Select
              options = {
                this.state.dates.map((label, index) => {
                  return {
                    label: label,
                    value: label,
                    key: index
                  }
              })}
              placeholder = 'Choisissez la date de début'
              onChange={this.changeMinDate}
            />
            <Alert variant="danger" show={errorMinDate} onClose={handleDismiss} dismissible>
                La date de début doit être inf à la date de fin
            </Alert>
          </div>
          <div className="chartSelectContainer">
            <Select
              options = {
                this.state.dates.map((label, index) => {
                  return {
                    label: label,
                    value: label,
                    key: index
                  }
              })}
              placeholder = 'Choisissez la date de fin'
              onChange={this.changeMaxDate}
            />
            <Alert variant="danger" show={errorMaxDate} onClose={handleDismiss} dismissible>
                La date de fin doit être sup à la date de début
            </Alert>
          </div>
          <CardDeck>
            <Card bg="light"><b>Min : {this.state.minValue.value}</b>  {this.state.minValue.time}</Card>
            <Card bg="light"><b>Max : {this.state.maxValue.value}</b>  {this.state.maxValue.time}</Card>
            <Card bg="light"><b>Average : {this.state.averageValue}</b></Card>
          </CardDeck>
        </div>
        <div>
          <Line
            options= {{
              responsive: true
            }}
            data = {this.state.data}/>
        </div>
      </div>)
  }
}
