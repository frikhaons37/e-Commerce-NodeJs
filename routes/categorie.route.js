var express = require('express');
var router = express.Router();
// Créer une instance de categorie. (create)
const Categorie = require('../models/categorie');
const auth = require( "../middleware/auth.js");
router.get('/', async (req, res, )=> {
    try {
        const cat = await Categorie.find({}, null, {sort: {'_id': -1}})
        res.status(200).json(cat);
        } catch (error) {
        res.status(404).json({ message: error.message });
        }
});

// chercher une catégorie (search)
router.get('/:categorieId',async(req, res)=>{
    try {   
        const cat = await Categorie.findById(req.params.categorieId);
        res.status(200).json(cat);
        } catch (error) {
        res.status(404).json({ message: error.message });
        }
});
// modifier une catégorie (edit)
router.put('/:categorieId', async (req, res)=> {
    try {
        const cat1 = await Categorie.findByIdAndUpdate(
        req.params.categorieId,
        { $set: req.body },
        { new: true }
        );
        res.status(200).json(cat1);
        } catch (error) {
        res.status(404).json({ message: error.message });
        }
});
// Supprimer une catégorie (delete)
router.delete('/:categorieId', async (req, res)=> {
    const id = req.params.categorieId;
await Categorie.findByIdAndDelete(id);
res.json({ message: "categorie deleted successfully." });
});
// créer une nouvelle catégorie  
router.post('/', async (req, res) => {
    const { nomcategorie, imagecategorie} = req.body;
    const newCategorie = new Categorie({nomcategorie:nomcategorie,
    imagecategorie:imagecategorie})
    try {
    await newCategorie.save();
    res.status(200).json(newCategorie );
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
    });
module.exports = router;
// Récupérer toutes les catégories
router.get('/all', auth, async (req, res) => {
    try {
      const categories = await Categorie.find({}, null, { sort: { '_id': -1 }});
      res.status(200).json(categories);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
  