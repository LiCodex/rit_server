const router = require("express").Router();
const Room = require("../models/room");
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
        console.log(active_tables);
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
  try {
    let room = await Room.findOne({ _id: req.params.id });

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


router.put("/hall/rooms/:id", async (req, res) => {
  try {
    let room = await Room.findOneAndUpdate(
      { _id: req.params.id },
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
      },
      { upsert: true }
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

module.exports = router;
