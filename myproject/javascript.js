var mysql = require('mysql');
var inq = require('inquirer')
var pmpt = inq.createPromptModule()
var questArr = []
var choiceItems = ''

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'auction_db',
    port: 3306
});

connection.connect(function (e) {
    if (e) throw e
});

var action = [
    new inputQ('action', 'Post (an item) or Bid?')
]

function inputQ(name, message) {
    this.type = 'input'
    this.name = name
    this.message = message
}

function dropDownQ(name, message, choices) {
    this.type = 'checkbox'
    this.name = name
    this.message = message
    this.choices = choices
}

var postItem = [
    new inputQ('item', "What is the item?"),
    new inputQ('description', "Short Description of item"),
    new inputQ('price', 'What is the starting price?'),
]

pmpt(action).then(function (r) {
    console.log(r.action)
    if (r.action === 'post' || r.action === 'Post') {
        pmpt(postItem).then(function (res) {
            var itemName = res.item
            var itemDesc = res.description
            var itemPrice = res.price
            var value = ('SET item="' + itemName + '", descript="' + itemDesc + '", price=' + itemPrice + ', available=true')
            var insertPost = 'INSERT INTO items_table ' + value
            console.log(value)
            //item goes into item

            connection.query(insertPost, function (e, result) {
                console.log(result.affectedRows + ' records updated.')
                if (e) throw e;
            });
            connection.end(function (e) {
                if (e) throw e
            });

        })
    } else if (r.action === 'bid' || r.action === 'Bid') {
        console.log('You want to bid!')
        var bidValue = 'SELECT * FROM items_table'
        connection.query(bidValue, function (e, r) {
            //throw stops the code, unlike console.log
            if (e) throw e;
            for (var i = 0; i < r.length; i++) {
                var temp = r[i]
                if (temp.available === 1) {
                    choiceItems = temp.item + '-->Description: ' + temp.descript + ', Price : $' + temp.price
                    questArr.push(choiceItems)
                }
            }

            var bidOnItem = [
                new dropDownQ('item', 'Which item would you like to bid on?', questArr),
                new inputQ('price', 'How much would you like to bid?')
            ]

            pmpt(bidOnItem).then(function (res) {
                var pushItem = res.item[0]
                var pushItemName = pushItem.split('-')
                var itemNameVal = pushItemName[0]
                var originalPrice = pushItem.split('$')
                var newToo = parseInt(originalPrice[1])
                var bidAmt = parseInt(res.price)
                var newValue = ('UPDATE items_table SET price = ? WHERE item = ?')
                if (bidAmt > newToo) {
                    connection.query(newValue, [bidAmt, itemNameVal], function (e, r) {
                        if (e) throw e
                        console.log('You have the highest bid!')
                    })
                } else if (bidAmt < temp.price) {
                    console.log("I'm sorry buy you're not the highest bidder.")
                    if (e) throw e
                } else {
                    console.log('an error occured')
                }
            })

        });
    }
})
connection.end(function (e) {
    if (e) throw e
});



