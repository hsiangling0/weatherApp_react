import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as RefreshIcon } from "./images/refresh.svg";
import WeatherIcon from "./WeatherIcon.js";

/*定義帶有styled的componend
  styled.div後加反引號`.....`
*/
const Container = styled.div`
  background-color: #ededed;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const WeatherCard = styled.div`
  background-color: #f9f9f9;
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 25px;
  color: #212121;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 17px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  /*flex-direction:row;*/
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Temperature = styled.div`
  margin-left: 5px;
  font-size: 96px;
  color: #757575;
  display: flex;
  font-weight: 300;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  font-size: 20px;
  align-items: center;
  margin-bottom: 16px;
  color: #828282;
  font-weight: 300;

  svg {
    width: 25px;
    margin-right: 30px;
    height: auto;
  }
`;

const Rain = styled.div`
  display: flex;
  font-size: 20px;
  align-items: center;
  margin-bottom: 16px;
  color: #828282;
  font-weight: 300;

  svg {
    width: 25px;
    margin-right: 30px;
    height: auto;
  }
`;

const Refresh = styled.div`
  right: 15px;
  bottom: 15px;
  position: absolute;
  display: inline-flex;
  align-items: flex-end;
  font-size: 12px;
  color: #828282;

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

const WeatherApp = () => {
  console.log("weather");
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    description: "",
    weatherCode: 0,
    temperature: 0,
    windSpeed: 0,
    rainPossibility: 0,
    comfortability: 0,
    humid: 0.33
  });
  const fetchingData = useCallback(() => {
    const fetchData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForcast()
      ]);
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  const fetchCurrentWeather = () => {
    return fetch(
      "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-A621BE27-A4FD-4C3D-9579-AA1FC282ECE5&locationName=臺北"
    )
      .then((response) => response.json())
      .then((data) => {
        const localData = data.records.location[0];

        const weatherElements = localData.weatherElement.reduce(
          (neededElements, item) => {
            if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );

        return {
          observationTime: localData.time.obsTime,
          locationName: localData.locationName,
          description: "多雲時晴",
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD
        };
      });
  };

  const fetchWeatherForcast = () => {
    return fetch(
      "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-A621BE27-A4FD-4C3D-9579-AA1FC282ECE5&locationName:臺北市"
    )
      .then((response) => response.json())
      .then((data) => {
        const localData = data.records.location[0];

        const weatherElements = localData.weatherElement.reduce(
          (neededElement, item) => {
            if (["Wx", "PoP", "CI"].includes(item.elementName)) {
              neededElement[item.elementName] = item.time[0].parameter;
            }
            return neededElement;
          },
          {}
        );

        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName
        };
      });
  };

  return (
    <Container>
      {console.log("render")}
      <WeatherCard>
        <Location>{weatherElement.locationName}</Location>
        <Description>
          {weatherElement.description} {weatherElement.comfortability}
        </Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(weatherElement.temperature)}
            <Celsius>°C</Celsius>
          </Temperature>
          <WeatherIcon />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {weatherElement.windSpeed} m/h
        </AirFlow>
        <Rain>
          <RainIcon />
          {Math.round(weatherElement.rainPossibility)}%
        </Rain>
        <Refresh onClick={fetchingData}>
          最後觀測時間:
          {new Intl.DateTimeFormat("zh-Tw", {
            hour: "numeric",
            minute: "numeric"
          }).format(new Date(weatherElement.observationTime))}{" "}
          <RefreshIcon />
        </Refresh>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
