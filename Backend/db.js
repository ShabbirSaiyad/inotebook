const mongoose = require('mongoose');

//Latest :
// main().catch(err => console.log(err));
// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/test');
//     console.log("succesful");

// }
const mongoURI = "mongodb://127.0.0.1:27017/inotebook";
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log("connected to Mongo Successfully")
    }
    catch (error) { console.log(error) }
}



module.exports = connectToMongo;