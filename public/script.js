document.getElementById('text').addEventListener('keypress', function (e) {
    console.log(e.target.value)
    if (e.key === 'Enter') {
        const p = document.createElement('p');
        p.classList.add('user-message')
        p.textContent = e.target.value;
        document.getElementById('messages').append(p)
        e.target.value = ''
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
