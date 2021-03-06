/* eslint-disable */
import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  Animated
} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import axios from "axios";
import { colors } from "../../lib/styleUtils";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { LoadingView } from "../../container/Base";
import { ModalView } from "../../container/Base";
import { ErrorModal } from "../../container/Base";
import * as memberActions from "../../redux/modules/member";

class NetworkScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      singleMember: {},
      members: [],
      setMembers: {
        name: "",
        gender: "1",
        team: ""
      },
      modalVisible: false,
      fadeAnim: new Animated.Value(0)
    };
  }

  //async는 promise를 반환한다.
  async componentDidMount() {
    const { MemberActions } = this.props;
    try {
      await MemberActions.fetchMembers();
    } catch (e) {
      console.log(e);
    }

    Animated.timing(this.state.fadeAnim, {
      toValue: 10,
      duration: 200,
      delay: 50
      // ease: Easing.inout()
    }).start();
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  onPressBtnObject = async () => {
    try {
      // fetch => promise 반환
      const url = "http://noldam.co.kr:4004/api/auth/test/0";
      const result = await axios.get(url);

      this.setState({
        singleMember: result.data
      });
    } catch (e) {
      console.log(e);
    }
  };

  onPressBtnList = () => {
    // try {
    //   const url = "http://noldam.co.kr:4004/api/auth/test";
    //   const result = await axios.get(url);
    //   this.setState({
    //     members: result.data
    //   });
    // } catch (e) {
    //   console.log(e);
    // }
  };

  onChangeText = type => value => {
    const { setMembers } = this.state;
    this.setState({
      setMembers: {
        ...setMembers,
        [type]: value
      }
    });
  };

  _onPress = item => {
    this.props.navigation.navigate("NetworkDetail", { item });
  };

  _onPressSetProfile = () => {
    // await MemerACtions.postMember(data); // 최종 이렇게 되야 한다.

    const data = this.state.setMembers;
    const url = "http://noldam.co.kr:4004/api/auth/test";
    axios.post(url, data);
    return this.onPressBtnList();
  };

  _onPressDelete = data => {
    Alert.alert("삭제 준비 중");
    // console.log(data);
    // return axios.delete(`http://noldam.co.kr:4004/api/auth/test/${data}`);
  };

  _onPressOpenModal = () => {
    // Alert.alert("1");
    this.props.navigation.navigate("ModalScreen");
    // return <ModalView />;
  };

  render() {
    const { members } = this.props;

    const {
      onPressBtnObject,
      onPressBtnList,
      _onPressSetProfile,
      _onPressItemDetail,
      _onPress,
      onChangeText,
      _onPressDelete,
      _onPressOpenModal
    } = this;
    const {
      singleMember: { gender, name, team },
      activeSwitch
    } = this.state;

    const options = [{ label: "여", value: 1 }, { label: "남", value: 0 }];

    const listComponents = members.map(item => {
      const { name, gender, team } = item;
      return (
        <View>
          <Text>
            이름 : {name}
            성별 : {gender === 0 ? "남자" : "여자"}
            소속 : {team}
          </Text>
        </View>
      );
    });

    return (
      <View style={styles.container}>
        <View style={styles.parentView}>
          <TouchableOpacity
            style={styles.btnAdd}
            activeOpacity={0.8}
            onPress={() => _onPressOpenModal()}
          >
            <Text>오류모달test</Text>
          </TouchableOpacity>

          <View>
            <Text>이름</Text>
            <TextInput
              style={styles.textInput}
              placeholder="이름을 입력해주세요"
              onChangeText={onChangeText("name")}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={{ marginVertical: 10 }}>
            <Text>성별</Text>
            <View style={{ width: 100, height: 50, paddingVertical: 10 }}>
              <SwitchSelector
                options={options}
                initial={0}
                onPress={onChangeText("gender")}
                fontSize={13}
                selectedColor="white"
                buttonColor="#FF6E40"
              />
            </View>
          </View>
          <View>
            <Text>소속</Text>
            <TextInput
              style={styles.textInput}
              placeholder="소속을 입력해주세요"
              onChangeText={onChangeText("team")}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              style={styles.btnAdd}
              activeOpacity={0.8}
              onPress={() => _onPressSetProfile()}
            >
              <Text>추가</Text>
            </TouchableOpacity>
          </View>
          <Animated.View style={{ opacity: this.state.fadeAnim }}>
            <ScrollView>
              <FlatList
                data={members}
                numColumns={2}
                keyExtractor={(item, index) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => this._onPress(item)}>
                    <View style={styles.parentItemView}>
                      <View style={styles.itemView}>
                        <Text> 이름 : {item.name} </Text>
                        <Text>
                          성별 : {item.gender === 0 ? "남자" : "여자"}
                        </Text>
                        <View style={styles.parentTeamContainer}>
                          <Text style={styles.txtBoxStyle}>
                            소속 : {item.team}
                          </Text>
                          <View style={styles.btnDelete}>
                            <TouchableOpacity
                              style={styles.btnDeleteTouchable}
                              onPress={() => _onPressDelete(item)}
                            >
                              <Text>삭제</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  parentView: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  textInput: {
    height: 45,
    borderWidth: 1,
    width: 150,
    paddingHorizontal: 10,
    marginTop: 10
  },
  btnAdd: {
    width: 70,
    height: 45,
    backgroundColor: "#FF6E40",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  parentItemView: {
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 180,
    flex: 2
  },
  itemView: {
    paddingVertical: 5,
    paddingVertical: 5,
    borderWidth: 1
  },
  parentTeamContainer: {
    flexDirection: "row"
  },
  txtBoxStyle: {
    flex: 1,
    paddingHorizontal: 4
  },
  btnDelete: {
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    width: 50,
    marginRight: 10
  },
  btnDeleteTouchable: {
    flex: 1,
    alignItems: "center",
    width: 40
  },
  btnPressList: {
    borderWidth: 1,
    width: 50,
    margin: 40,
    backgroundColor: "green"
  },
  btnObject: {
    width: 100,
    height: 45,
    backgroundColor: colors.main
  }
});

export default connect(
  state => ({
    members: state.member.get("members").toJS()
  }),
  dispatch => ({
    MemberActions: bindActionCreators(memberActions, dispatch)
  })
)(NetworkScreen);
