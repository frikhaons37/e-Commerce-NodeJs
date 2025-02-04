const express = require('express');
const router = express.Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Afficher la liste des utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Créer un nouvel utilisateur
router.post('/', async (req, res) => {
    const newUser = new User(req.body);
    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    const count = await User.countDocuments({
        role:'user',
    })
    res.status(200).json({count})
})

// Afficher les détails d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Mettre à jour les informations d'un utilisateur
router.put('/:userId', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: req.body },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer un utilisateur
router.delete('/:userId', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//Register
router.post('/register', async (req, res, )=> {
    const{name,email,password,role,avatar}=req.body;
    const user = await User.findOne({ email })
    
    if (user) return res.status(404).send({ success: false, message: "Account already exists" })
    const salt=await bcrypt.genSalt(10);
    const hash=await bcrypt.hash(password,salt);
    const newUser=new User({
    name:name,
    email:email,
    password:hash,
    role:role,
    avatar:avatar
    });
    try {
    await newUser.save();
    return res.status(201).send({ success: true, message: "Account created successfully", user: newUser })
    } catch (error) {
    res.status(409).json({ message: error.message });
    }
    });
    //Generate Token
    const generateToken=(user) =>{
    return jwt.sign({user}, process.env.TOKEN, { expiresIn: '60s' });
    }
    // login
    router.post('/login', async (req, res) => {
    try {
    let { email, password } = req.body
    if (!email || !password) {
    return res.status(404).send({ success: false, message: "All fields are required" })
    }
    let user = await User.findOne({ email })
    if (!user) {
    return res.status(404).send({ success: false, message: "Account doesn't exists" })
    } else {
    let isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch) {res.status(400).json({success: false, message:'Please verify your credentials'}); return;}
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(200).json({
    success: true,
    token,
    refreshToken,
    user
    })
    }
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
    });
    // Refresh
    function generateRefreshToken(user) {
    return jwt.sign({user}, process.env.REFRESH_TOKEN, { expiresIn: '1y' });
    }
    //Refresh Route
    router.post('/refreshToken', async (req, res, )=> {
    const refreshtoken = req.body.refreshToken;
    if (!refreshtoken) {
    return res.status(404).json({ success: false,message: 'Token Not Found'
    });
    }
    else {
    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) {
    return res.status(406).json({success: false, message:
    'Unauthorized Access' });
    }
    else {
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(200).json({
    token,
    refreshToken
    })
    }
    });
    }
    
    });

    
    module.exports = router;