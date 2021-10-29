//데이터를 바탕으로 서버에 통신을 해서 (postman) 그걸 mongoDB에 저장하는 코드
//잘 들어갔는지 확인하는게 Compass


var express = require("express");
var router = express.Router();
const locationModel = require("../model/location");  //require할때 js는 뒤에 붙이지 않아도 불러올 수 있음

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express"});
});

router.get("/upload",(req,res,next)=>{    //영상에서 말없이 '' 에서 ""로바뀜
  res.render("upload");                    
});

//테스트

// router.get("/test",(req,res,next) =>{
//   console.log("테스트 완료!!");
//   res.json({
//     message: "response 완료!!",
//   });
// });

// router.post("/test2", (req,res,next) =>{       //post는 body에 담기기때문에 get방식보다 좀 더 보안이 좋음
//   //비구조화 할당.여러 줄을 보낼때 한줄로 보내는 법
//   const {test,test2} = req.body;
//   console.log(test);
//   console.log(test2);
//   res.json({
//     message:"post 완료!!",
//   });
// });

router.post("/location", (req,res,next) => {
  const{ title, address, lat, lng } = req.body;
  let location = new locationModel();
  location.title = title;
  location.address = address;
  location.lat = lat;
  location.lng = lng;
  location.save().then((result) => {
    console.log(result);
    res.json({
      message : "success",
    });  //문제점  location.save는 비동기로 움직임.그래서 언제 저장되는지 알 수 없어서 res가 정확히 안이뤄질 가능성 존재.그래서 저장이 끝난 다음에 res를 가야하는데 그걸 가능하게 하는게 promise문법
  }) 
  .catch((error) => {
    console.log(error);
    res.json({
      message: "error",
    });
  });
});

//서버쪽에서 mongoDB로 데이터를 요청을 하고 결과값을 main.js에서 사용할 수 있도록 하는코드
router.get("/location", (req,res,next) => {
  //compass에 보면 _id,_v는 필요없는 키값이라 이를 제외해주는 코드
  locationModel
    .find({}, { _id: 0, __v: 0 })
    .then((result) => {
      console.log(result);
      res.json({
        message: "success",
        data: result,
      });
  })
    .catch((error) => {
      res.json({
        message: "error",
      });
    });
});

//서버쪽 준비 끝.이제 main.js 로 가서 /location url로 요청하고 데이터를 바탕으로 지도위에 마커를 표시



module.exports = router;
