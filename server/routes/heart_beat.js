const router = require("express").Router();

router.get('/heart_beat', async(req, res) => {
    try {
        res.json({
            success: true,
            server_ip: process.env.SERVERIP,
            server_port: process.env.SERVERPORT,
            message: "heart beat success"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;