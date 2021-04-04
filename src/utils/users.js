let users = [];

const addUser = ({ id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if(!username || !room){
        return {
            error: "Username and Roomname cannot be empty!"
        }
    }

    //check if existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: "Username in use"
        }
    }

    //user to be pushed to users array
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    
    const idx = users.findIndex((user) => user.id === id)

    if(idx > -1){
        return users.splice(idx, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}