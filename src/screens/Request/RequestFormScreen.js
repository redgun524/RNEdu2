import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Button,
  substr
} from "react-native";
import { colors, customStyle } from "../../lib/styleUtils";
import { ButtonNext } from "../../components/Auth";
import {
  RequestTicket,
  DayOfWeek,
  SelectDay,
  SelectTime,
  SelectPeriodTime
} from "../../components/Request";
import { moment } from "../../lib/timeUtil";
import * as requestActions from "../../redux/modules/request";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class RequestFormScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pickTicket: "L",
      mDayOfWeek: "0000000",
      radioValue: "",
      initDate: moment().format("YYYY[년] MM[월] DD[일] (ddd)"),
      fromDate: moment(),
      initTime: moment()
        .hour(9)
        .minute(0)
        .format(TIME_FORMAT),
      fromTime: moment()
        .hour(9)
        .minute(0),
      periodTime: 0,
      toTime: moment()
        .hour(11)
        .minute(0),
      addTime: 2
    };
  }

  componentDidMount() {
    console.log(">>>>componentDidMount");
    var { reqeustTicketInfo } = this.props;

    reqeustTicketInfo =
      reqeustTicketInfo === undefined ? undefined : reqeustTicketInfo.toJS();

    if (reqeustTicketInfo != undefined) {
      this.setState({
        ...this.state,
        pickTicket: reqeustTicketInfo.pickTicket,
        mDayOfWeek: reqeustTicketInfo.mDayOfWeek,
        daysArr: reqeustTicketInfo.daysArr,
        fromDate: reqeustTicketInfo.fromDate,
        fromTime: reqeustTicketInfo.fromTime,
        toTime: reqeustTicketInfo.toTime,
        periodTime: reqeustTicketInfo.periodTime
      });
    }
  }

  handleDayOfWeek = day => () => {
    var { mDayOfWeek } = this.state;
    var isSelected = 1;
    if (((mDayOfWeek >> day) & 1) === 1) {
      isSelected = 0;
    }

    this.setState({
      ...this.state,
      mDayOfWeek:
        isSelected === 1
          ? (mDayOfWeek |= 1 << day)
          : (mDayOfWeek &= ~(1 << day))
    });
  };

  _onPressPickTicket = type => () => {
    const value = type === "season" ? "L" : "S";
    this.setState({
      pickTicket: value
    });
  };

  onPeriodTimeChange = (type, date) => {
    // console.log("type >>>");
    // console.log(type);

    const { fromTime } = this.state;
    var { addTime } = this.state;

    switch (date) {
      case 0:
        addTime = 2;
        break;
      case 1:
        addTime = 3;
        break;
      case 2:
        addTime = 4;
        break;
      default:
        break;
    }

    this.setState({
      toTime: moment(fromTime, TIME_FORMAT).add(addTime, "h"),
      addTime: addTime,
      [type]: date
    });
  };

  onDateChange = type => date => {
    const { addTime } = this.state;
    var FORMAT = "";
    switch (type) {
      case "fromDate":
        FORMAT = "YYYY년 MM월 DD일 (ddd)";
        break;
      case "fromTime":
        FORMAT = "A hh:mm";
        break;
      default:
        break;
    }

    this.setState({
      toTime: moment(date, TIME_FORMAT).add(addTime, "h"),
      [type]: moment(date, FORMAT)
    });
  };

  _onPressRequestService = () => {
    const {
      pickTicket,
      mDayOfWeek,
      fromDate,
      fromTime,
      toTime,
      periodTime
    } = this.state;

    const dayArr = ["월", "화", "수", "목", "금", "토", "일"];
    var strArray = [];
    var daysArr = [];
    var strDayOfWeek = mDayOfWeek.toString(2).toString();

    //2진수 배열에 담기
    for (var i = strDayOfWeek.length; i > 0; i--) {
      strArray.push(strDayOfWeek.substring(i, i - 1));
    }
    //2진수 요일로 변환
    for (var i = 0; i < strArray.length; i++) {
      if (strArray[i] === "1") {
        daysArr.push(dayArr[i]);
      }
    }

    const data = {
      pickTicket: pickTicket,
      mDayOfWeek: mDayOfWeek,
      daysArr: daysArr.join(", "),
      fromDate: fromDate,
      fromTime: fromTime,
      toTime: toTime,
      periodTime: periodTime
    };

    const { requestActions } = this.props;
    requestActions.setRequestTicketInfo(data);

    this.props.navigation.navigate("Request", { data: data });
  };

  render() {
    var radio_props = [
      { label: "2시간", value: 0 },
      { label: "3시간", value: 1 },
      { label: "4시간", value: 2 }
    ];

    const {
      _onPress,
      _onPressPickTicket,
      onDateChange,
      onPeriodTimeChange,
      handleDayOfWeek,
      _onPressRequestService
    } = this;
    const {
      pickTicket,
      selectedPeriod,
      selectedService,
      initDate,
      initTime,
      periodTime,
      fromDate,
      fromTime,
      toTime,
      mDayOfWeek
    } = this.state;

    return (
      <View style={styles.container}>
        {/* 이용권 선택 */}
        <RequestTicket isSelected={pickTicket} onPress={_onPressPickTicket} />
        <View style={styles.viewTimeRequest}>
          <View style={styles.viewPlayTicket}>
            <Text style={styles.txtPlayTicket}>희망 요일</Text>
          </View>
          <View style={styles.grayLine} />
          <View style={styles.viewSelectDayTime}>
            {/* 요일 선택 */}
            <DayOfWeek onPress={handleDayOfWeek} isSelected={mDayOfWeek} />
            {/* 시작 날짜 선택 */}
            <SelectDay
              fromDate={fromDate}
              init={initDate}
              onPress={onDateChange}
            />
          </View>
          <View style={styles.grayLine} />
          {/* 시작 시간 선택 */}
          <SelectTime
            onPress={onDateChange}
            fromTime={fromTime}
            initTime={initTime}
          />
          <View style={styles.grayLine} />
          {/* 이용 시간 선택 */}
          <SelectPeriodTime
            radio_props={radio_props}
            periodTime={periodTime}
            onPress={onPeriodTimeChange}
          />
        </View>

        <View style={styles.txtResultPeriod}>
          <Text>
            {fromTime.format(TIME_FORMAT)} ~ {toTime.format(TIME_FORMAT)}
          </Text>
          <Text />
        </View>

        <ButtonNext onPress={_onPressRequestService} disabled={true}>
          지원받기
        </ButtonNext>
      </View>
    );
  }
}

const TIME_FORMAT = "A hh:mm";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(244, 244, 244)"
  },
  grayLine: {
    height: 2,
    backgroundColor: "rgb(244, 244, 244)"
  },
  txtServiceSubTitle: {
    fontSize: 11
  },
  viewPlayTicket: {
    height: 45,
    justifyContent: "center",
    backgroundColor: "rgb(255, 255, 255)"
  },
  txtPlayTicket: {
    marginLeft: 22.5,
    fontSize: 15
  },
  viewTimeRequest: {
    height: 256,
    backgroundColor: "rgb(255, 255, 255)",
    marginTop: 10
  },
  viewSelectDayTime: {
    height: 100
  },
  txtResultPeriod: {
    ...customStyle.center,
    height: 40
  },
  radioView: {
    marginTop: 15
  }
});

// export default RequestFormScreen;
export default connect(
  state => (
    console.log(state.request.get("reqeustTicketInfo")),
    {
      reqeustTicketInfo: state.request.get("reqeustTicketInfo")
    }
  ),
  // state => ({
  //   members: state.member.get("members").toJS()
  // }),
  dispatch => ({
    requestActions: bindActionCreators(requestActions, dispatch)
  })
)(RequestFormScreen);