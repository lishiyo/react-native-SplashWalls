/**
 * https://www.smashingmagazine.com/2016/04/the-beauty-of-react-native-building-your-first-ios-app-with-javascript-part-1/
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  ActivityIndicator,
  ListView,
  ScrollView,
  Image,
  Dimensions,
  PanResponder,
  CameraRoll,
  AlertIOS
} from 'react-native';
import { uniqueRandomNumbers, distance } from './utils'
import Swiper from 'react-native-swiper';
import NetworkImage from 'react-native-image-progress'
import * as Progress from 'react-native-progress'
import EStyleSheet from 'react-native-extended-stylesheet';

const { width, height } = Dimensions.get('window')
const URL = 'https://unsplash.it/list'
const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300; // milliseconds
const DOUBLE_TAP_RADIUS = 20;

// === DEFINE FLOW TYPES ====
type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSONObject>;
type Props = mixed;
type State = {
  // ds: (JSONArray) => JSONArray,
  isLoading: boolean,
  wallsJSON: JSONArray
};

export default class RootContainer extends Component {
  // define fields' flow types
  props: Props;
  state: State;
  imagePanResponder: Object = {};
  prevTouchInfo: Object = {};
  //  index of the wallpaper that is currently visible on the screen
  currentWallIndex: number;

  static defaultProps: {
    visited: boolean
  };

  constructor(props: Props) {
    super(props);
    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = { // use this.setState everywhere else
      // ds: ds,
      wallsJSON: [],
      isLoading: true
    }

    // init pan responder
    this.imagePanResponder = {};
    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    };
    this.currentWallIndex = 0;
  }
  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant.bind(this),
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });
    this._onMomentumScrollEnd = this._onMomentumScrollEnd.bind(this);
  }
  componentDidMount() {
  	this.fetchWallsJson();
  }

  fetchWallsJson(){
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
  _generateImageUri(wallpaper: JSONObject) {
    return `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`;
  }
  _onMomentumScrollEnd(e, state, context) {
    console.log("onMomentumScrollEnd! state, context.state", state, context.state)
    this.currentWallIndex = state.index;
  }
  saveCurrentWallpaperToCameraRoll() {
    const { wallsJSON } = this.state;
    const currentWall = wallsJSON[this.currentWallIndex];
    const currentWallUrl = this._generateImageUri(currentWall);

    CameraRoll.saveToCameraRoll(currentWallUrl)
      .then(resp => {
        console.log("successfully saved! resp? ", resp)
        AlertIOS.alert(
          'Saved',
          'Wallpaper successfully saved to Camera Roll',
          [
            {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
          ]
        );
      })
      .catch(err => {
        console.log('Error saving to camera roll', err);
      })
  }

  // PANRESPONDER
  handleStartShouldSetPanResponder(e: Object, gestureState: Object) {
      return true;
  }
  handlePanResponderGrant(e: Object, gestureState: Object) {
    console.log('ResponderGrant: Finger touched the view');
    let currentTouchTimeStamp = Date.now();
    if (this._isDoubleTap(currentTouchTimeStamp, gestureState)) {
      console.log("DOUBLE TAP detected");
      this.saveCurrentWallpaperToCameraRoll();
    }
    // update touch info
    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimeStamp: currentTouchTimeStamp
    }
  }
  handlePanResponderEnd(e: Object, gestureState: Object) {
    console.log('ResponderEnd: Finger pulled up from the view');
  }
  _isDoubleTap(currentTouchTimeStamp, { x0, y0 }) {
    const {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo;
    const dt = currentTouchTimeStamp - prevTouchTimeStamp;
    return (dt < DOUBLE_TAP_DELAY && distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
  }

  // ==== RENDER ===
  _renderResults() {
      const { wallsJSON, isLoading} = this.state;
      if (!isLoading) {
        return (
          <Swiper
            dot={<View style={styles.dot} />}
            activeDot={<View style={styles.activeDot} />}
            loop={false}
            onMomentumScrollEnd={this._onMomentumScrollEnd}
            >
            { wallsJSON.map((wallpaper, index) => this._renderRow(wallpaper, index)) }
          </Swiper>
        );
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
  _renderRow(wallpaper: JSONObject, index: number) {
    let imageUri = this._generateImageUri(wallpaper)
    return(
      <View key={index}>
        <NetworkImage
          source={{uri: imageUri }}
          {...this.imagePanResponder.panHandlers}
          indicator={Progress.Circle}
          style={styles.wallpaperImage}
          indicatorProps={{
            color: 'rgba(255, 255, 255)',
            size: 60,
            thickness: 7
          }}
        >
          <Text style={styles.label}>Photo by</Text>
          <Text style={styles.label_authorName}>{wallpaper.author}</Text>
        </NetworkImage>
      </View>
    );
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

const styles = EStyleSheet.create({
  loadingContainer: {
  	flex: 1,
    flexDirection: 'column',
    backgroundColor: 'blue',
    justifyContent: 'center'
  },
  text: {
    color: '#c93f3f'
  },
  dot: {
    backgroundColor:'rgba(255,255,255,.4)',
    width: 8,
    height: 8,
    borderRadius: 10,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 25
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 13,
    height: 13,
    borderRadius: 7,
    marginLeft: 7,
    marginRight: 7,
    marginBottom: 22
  },
  wallpaperImage: {
    // flexGrow: 1,
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  label: {
    position: 'absolute',
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 20,
    left: 20,
    width: width/2
  },
  label_authorName: {
    position: 'absolute',
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 41,
    left: 20,
    fontWeight: 'bold',
    width: width/2
  }
});
