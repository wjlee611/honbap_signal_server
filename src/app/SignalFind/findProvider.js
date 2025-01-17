const { pool } = require("../../../config/database");
const { errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");

const findDao = require("./findDao");
const haversine = require('haversine');

exports.getSignalList= async function (userIdx) 
{
    try 
    {
      const connection = await pool.getConnection(async (conn) => conn);
      const params = [userIdx, userIdx, userIdx];
      // status = on 인 사람 조회하기 
      const signalOnUserIdxList = await findDao.getSignalStatus(connection, params);

      // userLocation Table에서 내 최신 위치 정보 불러오기
      const myLocationResult = await findDao.selectUserLocation(connection, userIdx);
      

      console.log(`myLocationResult ${myLocationResult[0].latitude}, ${myLocationResult[0].longitude}`);
  
      // Siganling Table에서 활성화된 시그널의 User들 정보 가져오기
      // const signalPromiseArea = await findDao.selectSignalLocation(connection);
      // console.log(`signalPromiseArea ${signalPromiseArea[2].sigPromiseArea}`);
      // ARzone Table에서 위도, 경도 받아오기

      console.log(signalOnUserIdxList.length)
      // 전역 변수 선언 

      let userOnList = [];

      // address = ? 에서 for문 안쓰면 주소 여러개 중에 하나만 받고 끝남.
      for(var i=0; i < signalOnUserIdxList.length; i++)
      {
        const userLocation  = await findDao.selectSignalLocation(connection, signalOnUserIdxList[i].userIdx); 
        // status =1 인 sigPromiseArea 
        console.log(signalOnUserIdxList[i].userIdx)
        console.log(userLocation[0])

        const distance = haversine(myLocationResult[0], userLocation[0]);

        if(distance > 0 || distance < 10 ) // range = 10km
        {
          if(signalOnUserIdxList[i].userIdx != userIdx)
          {
            userOnList.push(signalOnUserIdxList[i]);
          }
        }
        else if(distance > 10)
        {
          console.log("10km 거리에서 벗어난 시그널 입니다.");
          console.log("--------------------------------");
        }
        else
        {
          console.log("error");
        }
        
        // status =1 인 sigPromiseArea의 위도, 경도 리스트화
      }

      
      connection.release();
      //return userOnList ;
      return signalOnUserIdxList;
    }
      

      // for (var i = 0; i < Object.keys(signalPromiseArea).length; i++){
        
      //   arLocationResult.latitude = arLocation[i][0];
      //   arLocationResult.longitude = arLocation[i][1];

      //   distance = haversine(myLocationResult[0], arLocationResult);
      //   console.log(`현재 위치와 ${signalPromiseArea[i].sigPromiseArea}의 좌표인 ${arLocation[i][0]} , ${arLocation[i][1]}의 거리는 : ${distance}`);
        
      //   if(distance == 3 || distance < 3 ) // range = 3km
      //   {
      //     matchingAddress.push(signalPromiseArea[i].sigPromiseArea);
      //     // Signaling Table에서 장소 데이터 -> sigIdx
      //   }
      //   else if(distance > 3)
      //   {
      //     console.log("3km 거리에서 벗어난 시그널 입니다.");
      //     console.log("--------------------------------")
      //   }
      //   else
      //   {
      //       console.log("error");
      //   }
      // }
      /*######
      page - end / start index 설정
      ###############*/
      /*
      [Test 사항]
      1.기존 꺼가 남아있을지.
      => start는 0으로 하고 end 만 계속 늘려야되는 거 아닌지. 어차피 스크롤으로 나뉘지 않나.
      2. 0~10, 10~20, 20~30  불러오기
      3. page로 딱 나뉘어져있으면 상관없을 것 같은데 스크롤 내리는 거 기준으로 DB
      불러오는 거면
      
      */

    //  param = [matchingAddress,start,end]
    //   const signalInfo = findDao.getSignalByAddress(connection, param); // 리스트 감싸니까 IN 먹히네.
          
    //   console.log("내 근처 시그널의 signal Idx를 반환합니다.");


      // if (page > Math.round(signalInfo[0].total / pageSize))
      // {
      //   console.log("지금까지 반환한 총 데이터 갯수와 (페이지 인덱스 * 사이즈)가 맞지 않습니다")
      //   return null;
      // }
          
      
      // return signalInfo;  // 현재 3km 안에 있는 시그널Idx 리스트. 없으면 []
    
    catch (err) {
      logger.error(`findProvider error\n: ${err.message}`);
      return errResponse(baseResponse.DB_ERROR);
    }
    //[[{signalIdx : 8}], [{signalIdx : 9}]]
}