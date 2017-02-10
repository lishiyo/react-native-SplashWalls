/**
 * https://www.smashingmagazine.com/2016/04/the-beauty-of-react-native-building-your-first-ios-app-with-javascript-part-1/
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ListView,
  ScrollView,
  Image
} from 'react-native';
import { uniqueRandomNumbers } from './utils'
import Swiper from 'react-native-swiper';

const URL = 'https://unsplash.it/list'
const NUM_WALLPAPERS = 5;

type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSONObject>;
type State = {
  ds: (JSONArray) => JSONArray,
  isLoading: boolean,
  wallsJSON: JSONArray
};
type Props = mixed;

export default class RootContainer extends Component {
  props: Props;

  state: State;

  static defaultProps: { visited: boolean };

  constructor(props: Props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = { // use this.setState everywhere else
      ds: ds,
      wallsJSON: [],
      isLoading: true
    }
  }
  componentDidMount() {
  	this._fetchWallsJson();
  }
  _fetchWallsJson( ){
    fetch(URL)
    .then(resp => resp.json())
    .then(jsonData => {
      const randomIds = uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length)
      const walls = randomIds.map(randomId => jsonData[randomId])
      this.setState({
        isLoading: false,
        wallsJSON: walls
      })
    })
    .catch(err => console.log('fetch error', err))
  }
  _renderRow(rowData) {
    console.log(rowData.post_url)
    let pic = {
      uri: rowData.post_url
    };
    return (
      <View>
        <Text style={styles.text}> {rowData.author} </Text>
      </View>
    )
  }
  _onMomentumScrollEnd(e, state, context) {
    console.log(state, context.state)
  }
  _renderResults() {
      const { wallsJSON, isLoading} = this.state;
      if (!isLoading) {
        return (
          <Swiper
            dot={<View style={
              { backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8, borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3 }} />}

            activeDot={<View style={
              { backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7 } } />}

            loop={false}

            onMomentumScrollEnd={this._onMomentumScrollEnd}
            >
            {wallsJSON.map((wallpaper, index) => {
              return(
                <Text key={index}>
                  {wallpaper.author}
                </Text>
              );
            })}
          </Swiper>
        );
      {/**
        <ScrollView contentContainerStyle={styles.loadingContainer}>
          <ListView
            dataSource={this.state.wallsJSON}
            renderRow={(rowData) => this._renderRow.call(this, rowData)}
          />
        </ScrollView>
        **/}
      }
  }
  _renderLoadingMessage() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={'#c93f3f'}
          style={{margin: 15}} />

        <Text style={styles.text}>
          Contacting Unsplash
        </Text>
      </View>
    )
  }
  render() {
    const { isLoading } = this.state
    if (isLoading) {
      return this._renderLoadingMessage()
    } else {
      return this._renderResults()
    }
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
  	flex: 1,
    flexDirection: 'column',
    backgroundColor: '#dbd8d8',
    justifyContent: 'center'
  },
  text: {
    color: '#c93f3f'
  }
});
