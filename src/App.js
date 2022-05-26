import logo from './logo.svg';
import './App.css';
import Chart from 'react-google-charts';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Button, Checkbox, FormControlLabel, InputLabel, MenuItem, Select, Slider } from '@mui/material';

function App() {
  const [covid, setCovid] = useState()
  const [variant, setVariant] = useState()
  const [select, setSelect] = useState("Alpha")
  const [date, setDate] = useState("2021-12-27")
  const [allDate, setAllDate] = useState()
  const [accumulated, setAccumulated] = useState(false)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    getCovid()
    getDate()
  }, [select, date, accumulated])

  const groupBy = (array, key) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };

  const getCovid = async () => {
    if (accumulated) {

      let { data } = await supabase
        .from('covid')
        .select()
        .lt("date", date)

      const groupByVariant = groupBy(data, "variant")

      setVariant(Object.keys(groupByVariant))

      const geo = [["Country", "Total"]]

      groupByVariant[select].forEach(element => {
        geo.push([element.location, element.num_sequences])
      });

      setCovid(geo)
    } else {
      let { data } = await supabase
        .from('covid')
        .select()
        .eq("date", date)

      const groupByVariant = groupBy(data, "variant")

      setVariant(Object.keys(groupByVariant))

      const geo = [["Country", "Total"]]

      groupByVariant[select].forEach(element => {
        geo.push([element.location, element.num_sequences])
      });

      setCovid(geo)
    }
  }


  const getDate = async () => {
    let { data } = await supabase
      .from('covid')
      .select("date")


    const groupByDate = groupBy(data, "date")

    setAllDate(Object.keys(groupByDate))
  }

  function valuetext() {
    return `${date.substring(5, 7)}/${date.substring(8, 10)}/${date.substring(0, 4)}`;
  }

  useEffect(() => {
    if (play === true) {
      let counter = 0
      const i = setInterval(() => {
        setDate(allDate[counter])
        counter++
        if (play === false) {
          clearInterval(i)
        }
        if (counter === allDate.length) {
          clearInterval(i)
          setPlay(false)
        }
      }, 1000)
    }
  }, [play])

  return (
    <div className="App">
      <h1>Covid Daily Cases</h1>
      <InputLabel id="selectCovid">Variant</InputLabel>
      <Select
        labelId="abel"
        id="able"
        value={select}
        label="Variant"
        onChange={(e) => setSelect(e.target.value)}
      >
        {variant && variant.map((v, i) => <MenuItem key={i} value={v}>{v}</MenuItem>)}
      </Select>

      <h3>Date: {`${date.substring(5, 7)}/${date.substring(8, 10)}/${date.substring(0, 4)}`}</h3>
      <div style={{ width: "80%", margin: 10 }} >

        <Slider
          disabled={play}
          defaultValue={20}
          max={allDate && allDate.length - 1}
          getAriaValueText={valuetext}
          valueLabelFormat={valuetext}
          step={1}
          onChange={(e) => setDate(allDate[e.target.value])}
          valueLabelDisplay="auto"
        />
        <FormControlLabel control={<Checkbox value={accumulated} onChange={(e) => setAccumulated(!accumulated)} />} label="Accumulate to this date" />

      </div>
      <Chart
        chartType="GeoChart"
        width="100%"
        height="400px"
        data={covid}
      />
      <Button disabled={play} variant="contained" onClick={() => setPlay(true)} >Play </Button>
    </div>
  );
}

export default App;
