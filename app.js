//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

var path = require('path');
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kuper:kokoriko1992@Todolist.gvrdd.mongodb.net/todolistDB");

const itemsSchema = {
  name: {
    type: String,
    required: [true, "Please check your data entry no name specified"]
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});


const defaultItems = [item1,item2,item3];


// new list with Schema !
const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});
// List.deleteMany({ name: "home" },function(err){
//   console.log("Done")
// });

app.get("/:custuomListName",function(req,res){
  const customListName = _.capitalize(req.params.custuomListName);


  List.findOne({name: customListName} ,function(err,foundList){
    if(!err){
      if(!foundList){
        // create new list
        const list = new List({
          name : customListName ,
          items : defaultItems
        });
          list.save();
          res.redirect("/"+ customListName);
    }else{
      res.render("list",{
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  }
 });


});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

  //
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


app.post("/delete",function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId , function(err){
      if (!err){
        console.log("Item was deleted");
        res.redirect("/");
  }
  });
  }else {
    // pull from our item array the item with the id that qual to checkedItemId!
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});



// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});


let port = process.env.PORT || 3000;
if (port == null || port == "") {
  port = 3000;
}

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening ");
});
