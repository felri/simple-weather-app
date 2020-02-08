import React from 'react';
import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import Btn from 'src/components/Btn'
import Map from 'src/components/Map'
import Title from 'src/components/Title'
import TryAgain from 'src/components/TryAgain'
import Table from 'src/components/Table'
import Loading from 'src/components/Loading'
import SearchBtn from 'src/components/SearchBtn'
import { useDispatch, useSelector } from 'react-redux'

import { getLocation, getWeatherInfo } from 'src/utils/api'

import styles from './styles'

export default ({ navigation }) => {
  const [location, setLocation] = React.useState({})
  const [error, setError] = React.useState('')
  const [denied, setDenied] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [measurement, setMeasurement] = React.useState('C')

  const dispatch = useDispatch();
  const cityData = useSelector(state => state.weatherData.data);
  const favorite = useSelector(state => state.favorite.data);

  React.useEffect(() => {
    if (!favorite && !cityData) navigation.navigate('Search')
  }, [])

  React.useEffect(() => {
  }, [cityData])

  const askForLocation = async () => {
    await Location.requestPermissionsAsync()
    getLocationAsync()
  }

  const getLocationAsync = async () => {
    setLoading(true)
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      setDenied(true)
      setLoading(false)
      setError('Permissão para acessar localização foi negada')
    } else {
      let location = await Location.getCurrentPositionAsync({})
      setDenied(false)
      setLocation(location)
      getWeatherData(location)
    }
  };

  const goToSearch = () => {
    navigation.navigate('Search')
  }

  const getWeatherData = async (location) => {
    const city = await getLocation({ lat: location.coords.latitude, long: location.coords.longitude })
    if (city.length > 0 && city[0].woeid) {
      const weatherInfo = await getWeatherInfo({ id: city[0].woeid })
      setWeatherInfo(weatherInfo)
      setLoading(false)
    }
  }

  const handleChangeMeasurement = (measurement) => {
    setMeasurement(measurement)
  }

  return loading ? <Loading /> :
    denied ?
      <TryAgain onPress={askForLocation} error={error} />
      :
      <View style={styles.container}>
        <Title weatherInfo={weatherInfo} measurement={measurement} />
        <SearchBtn askForLocation={askForLocation} goToSearch={goToSearch} />
        <Map location={location} />
        <Table weatherInfo={weatherInfo} measurement={measurement} />
        <Btn onPress={handleChangeMeasurement} measurement={measurement} />
      </View>
}
