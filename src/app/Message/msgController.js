const jwtMiddleware = require("../../../config/jwtMiddleware");
const baseResponse = require("../../../config/baseResponseStatus");

const msgProvider = require("../../app/Message/msgProvider");
const msgService = require("../../app/Message/msgService");

const { response, errResponse } = require("../../../config/response");

// 쪽지 방 생성
exports.createMsgRoom = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;    // 나중에 jwt로 변경
  const matchIdx = req.body.matchIdx;

  const roomId = userIdx + '_' + matchIdx;

  if(!matchIdx) {
    return res.send(response(baseResponse.MSG_MATCHIDX_EMPTY));
  } // matchIdx 값이 들어오지 않았습니다.

  const result = await msgService.createMsgRoom(userIdx, matchIdx, roomId);
  return res.send(baseResponse.SUCCESS);
}

// 쪽지 방 조회
exports.getMsgRoom = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;

  const result = await msgProvider.getMsgRoom(userIdx);

  return res.send(response(baseResponse.SUCCESS, result));
}

// 쪽지 보내기
exports.sendMsg = async function (req, res) {
  const senderIdx = req.verifiedToken.userIdx;
  const roomId = req.params.roomId;
  const text = req.body;

  if(!senderIdx) {
    return res.send(response(baseResponse.MSG_SENDERIDX_EMPTY));
  }
  if(!text) {
    return res.send(response(baseResponse.MSG_TEXT_EMPTY));
  }
  if(text > 500) {
    return res.send(response(baseResponse.MSG_TEXT_OVER));
  }

  const result = await msgService.sendMsg(roomId, senderIdx, text);
  return res.send(baseResponse.SUCCESS);
}

// 쪽지 내용 확인
exports.getMsg = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const roomId = req.params.roomId;

  if(!roomId) {
    return res.send(response(baseResponse.MSG_ROOMID_EMPTY));
  }

  const arr = roomId.split("_");
  const userIdx = arr[0];
  const matchIdx = arr[1];

  // 보낸/받는 사람 구별
  if (userIdxFromJWT == userIdx) {
    const result = await msgProvider.getMsg(roomId, userIdx, matchIdx);
    return res.send(response(baseResponse.SUCCESS, result));
  }
  else if (userIdxFromJWT == matchIdx) {
    const result = await msgProvider.getMsg(roomId, matchIdx, userIdx);
    return res.send(response(baseResponse.SUCCESS, result));
  }
};

// 쪽지 방 삭제
exports.deleteMsg = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;
  const roomId = req.body.roomId;

  if(!roomId) {
    return res.send(response(baseResponse.MSG_ROOMID_EMPTY));
  }

  const arr = roomId.split("_");
  const userIdxAtRoom = arr[0];
  const matchIdxAtRoom = arr[1];

  const getRoomIdxResult = await msgProvider.getRoomIdx(roomId);
  const MsgRoomUserIdx = getRoomIdxResult[0].userIdx;
  const MsgRoomMatchIdx = getRoomIdxResult[0].matchIdx;

  if(MsgRoomUserIdx == 7 || MsgRoomMatchIdx == 7) {
    const result = await msgService.deleteMsg(roomId);
  } else if(userIdx == userIdxAtRoom) {
    const result = await msgService.updateExitUserIdx(roomId, MsgRoomMatchIdx, 1);
  } else if(userIdx == matchIdxAtRoom) {
    const result = await msgService.updateExitUserIdx(roomId, MsgRoomUserIdx, 2);
  } 

  return res.send(baseResponse.SUCCESS);
}