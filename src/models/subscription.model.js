import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
            subscriber: {
                type: Schema.Types.ObjectId,
                ref: "User" // one who subscribes to the channel
            },
            channel: {
                type: Schema.Types.ObjectId,
                ref: "User" // one to whom subscriber is subscribing
            },

        } , {
            timestamps: true
        });

// Subscriber: The user who is subscribing to the channel
// Channel: The user whose channel is being subscribed to
// both are user objects 
// user(subscriber) : a, b, c, d, e
// channel : P, Q, R, e

// a -> P, Q, R so for each subscription new document will be created in subscription collection 
// { subscriber: a, channel: P } , { subscriber: a, channel: Q } , { subscriber: a, channel: R }


// b -> P, Q, e
// { subscriber: b, channel: P } , { subscriber: b, channel: Q }, { subscriber: b, channel: e }

//if we need to find 

//Subscriber list of a channel P,  
//lookup(channel: P) => { subscriber: a, channel: P }, { subscriber: b, channel: P } => a, b

//Channel list of user a
//lookup(subscriber: a) => { subscriber: a, channel: P }, { subscriber: a, channel: Q }, { subscriber: a, channel: R } => P, Q, R




export const Subscription = mongoose.model("Subscription", subscriptionSchema);