
chrome.runtime.onMessage.addListener(({ name, data }) => {
    console.log('Received message from background script: ', name, data);
    if (name === 'message') {
        const p = document.createElement('p');
        p.classList.add('bot-message')
        p.innerHTML = data;
        document.getElementById('messages').innerHTML = '';
        document.getElementById('messages').append(p)
        document.getElementById("messages").scrollBy(0, 10000);
    }
})    

document.getElementById('precise').addEventListener('click', function (e) {
    if (e.target.checked) {
        console.log('Feur')
    }  
    
    else {
        console.log('Quoi')
    }
    


})
