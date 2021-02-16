const router = require("express").Router();
const Room = require("../models/room");

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
        let rooms = await Room.find();

        res.json({
            success: true,
            rooms: rooms,
            message: "Successfully created a new room"
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