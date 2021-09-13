const socket = io();
let messageArea = document.getElementById('Read');
let count=0;
const change = () =>{
    const y = document.getElementById('KEY').value;
    if(!y){
        alert('Please enter something');
        return;
    }
    count++;
    document.getElementById('Current_Room').innerHTML = `${y.trim()}`;
    document.getElementById('Random').style.display = 'none';
    document.getElementById('Info').style.display = 'none';
    document.getElementById('CurrentChange').style.display = 'none';
    document.getElementById('Instant').style.display = 'inline';
    //join rooms
    socket.emit('join', y.trim());
}
const appendMessage = (msg,type) =>{
    let maindiv = document.createElement('div');
    let className = type;
    maindiv.classList.add(className,'message');
    if(type === 'incoming'){
        maindiv.innerHTML =  `
                    <div class="card mr-auto ml-3 text-center mt-3 mb-3 bg-light text-dark" style="width:fit-content;max-width:60vw;">
                        <div style="padding:0px 10px 0px 10px;">
                            <small class="text-danger"><b>${msg.user}</b></small>
                            <p>${msg.mess}</p>
                        </div>
                    </div>
                `;
    }else{
        maindiv.innerHTML =  `
                    <div class="card ml-auto mr-3 text-center mt-3 mb-3 bg-dark text-light" style="width:fit-content;max-width:60vw;">
                        <div style="padding:0px 10px 0px 10px;">
                            <small class="text-warning"><b>${msg.user}</b></small>
                            <p>${msg.mess}</p>
                        </div>
                    </div>
                `;
    }
    messageArea.appendChild(maindiv);
}
const sendMessage = (msg) =>{
    const name = document.getElementById('nameMain').innerHTML;
    const room = document.getElementById('Current_Room').innerHTML;
    let message = {
        user : name,
        mess : msg.trim(),
        room : room
    }
    appendMessage(message,'outgoing');
    //send to server
    document.getElementById('messagewritten').value = "";
    socket.emit('message', message);
}
const func = () =>{
    const x = document.getElementById('messagewritten').value;
    if(!x){
        alert('Please write something !!');
        return;
    }else if(count === 0){
        alert('You are not connected to any room !!');
        return;
    }else{
        sendMessage(x);
        let elem = document.getElementById('Read');
        elem.scrollTop = elem.scrollHeight;
    }
}
const check = (event) =>{
    if(event.key === 'Enter'){
        func();
    }
}
//Recieve Messages
socket.on('message',(msg)=>{
    appendMessage(msg,'incoming');
});