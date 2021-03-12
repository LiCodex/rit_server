const router = require("express").Router();
const Room = require("../models/room");
const ObjectID = require('mongodb').ObjectID;
const url = require('url');

router.post("/hall/create_room", async (req, res) => {
    if (!req.body.stake || !req.body.players) {
        console.log(req.body);
        res.json({ success: false, message: "Please enter stake or player" });
    } else {
        try {
            let newRoom = new Room();
            newRoom.name = req.body.name;
            newRoom.stake = req.body.stake;
            newRoom.players = req.body.players;
            newRoom.room_status = req.body.room_status;
            newRoom.starting_time = Date.now();
            newRoom.blind_type = req.body.blind_type;
            await newRoom.save();

            res.json({
                success: true,
                message: "Successfully created a new room"
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
});
//add filter information
router.get("/hall/rooms", async (req, res) => {
    try {
        const queryObject = url.parse(req.url,true).query;
        if (queryObject.blind_type != null) {
            var rooms = await Room.find({ blind_type: queryObject.blind_type });
        } else {
            var rooms = await Room.find();
        }
        var active_tables = rooms.filter(room => room.players < 8).length;
        res.json({
            success: true,
            rooms: rooms,
            active_tables: active_tables,
            message: "Successfully returned rooms"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.get("/hall/rooms/:id", async (req, res) => {
  console.log(req.params.id);
  var o_id = new ObjectID(req.params.id);
  try {
    let room = await Room.findOne({ _id: o_id });

    console.log(room);
    res.json({
      success: true,
      room: room
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// seats_status 0, 1
//
router.put("/hall/rooms/:id", async (req, res) => {
  console.log(req.params.id);
  var o_id = new ObjectID(req.params.id);
  try {
    let room = await Room.updateOne(
      { _id: o_id },
      {
        $set: {
          seats_status: req.body.seats_status,
          button_position: req.body.button_position,
          next_button_position: req.body.next_button_position,
          player_bank: req.body.player_bank,
          table_chips: req.body.table_chips,
          player_name: req.body.player_name,
          player_avatar: req.body.player_avatar,
          player_remaining_time: req.body.player_remaining_time
        }
      }
    );

    res.json({
      success: true,
      room: room
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// router.get("/auth/user", verifyToken, async (req, res) => {
//     try {
//         let foundUser = await User.findOne({ _id: req.decoded._id }).populate(
//             "address"
//       );
//       if (foundUser) {
//         res.json({
//           success: true,
//           user: foundUser
//         });
//       }
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: err.message
//       });
//     }
//   });

//     local arg = ngx.req.get_uri_args()
//     local size = tonumber(arg.size or 0)
//     local empty = arg.empty

//     local list = roomlogic.getadminroomlist(rediscli,size,empty)

//     local result = {}
//     result.errcode = 0
//     result.code = 20000
//     result.list = list
//     result.data = list
//     return result

module.exports = router;
