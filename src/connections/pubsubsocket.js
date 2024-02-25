import io from 'socket.io-client'
import toserver from './toserver';

const url = toserver?.pubsubsocket_url

let socketConn

export const initializepubsubsocket = () => {
  return new Promise((resolve, reject) => {
    try {
      const socket = io(`${url}`);
      socket.on('connect', () => {
        socketConn = socket;
        resolve();
      });
      socket.on('connect_error', () => {
        reject(new Error(`Something went wrong on our side.\nPlease try again.`));
      });
    } catch (error) {
      reject(error?.message);
    }
  });
};

export const getpubsubsocketconn = () => {
  return new Promise((resolve, reject) => {
    if(socketConn){
      resolve(socketConn)
    } else {
      reject(new Error(`Socket connection not found!`));
    }
  })
}

export const subscribesegment = ({ segment, pushtoemit, emitsegment }) => {
  return new Promise((resolve, reject) => {
    try{
      if(socketConn && segment){
        socketConn.emit('subscribe', {
          segment: segment,
          pushtoemit: (pushtoemit && emitsegment) ? pushtoemit : false,
          emitsegment: (emitsegment && pushtoemit) ? emitsegment : null
        });
        resolve("Subscribed successfully!");
      } else {
        reject(new Error("Invalid input or socket connection doesn't exist!"));
      }
    } catch (error) {
      reject(error?.message)
    }
  })  
}

export const unsubscribesegment = (segment) => {
  return new Promise((resolve, reject) => {
    try{
      if(socketConn && segment){
        socketConn.emit('unsubscribe', segment);
        resolve(`Unsubscribed scuccessfully!`);
      } else {
        reject(new Error("Invalid input or socket connection doesn't exist!"));
      }
    } catch(error){
      reject(error?.message)
    }
  })
}
