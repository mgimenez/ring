(function(win, doc){

    var socket = io(),
        audio = new Audio('assets/ring.mp3'),
        conf = {
            iconRing: 'assets/img/ring.png'
        };

    doc.addEventListener('DOMContentLoaded', function () {

        var btnRing = doc.querySelector('button'),
            inputUser = doc.querySelector('.user-name'),
            nameEntred = doc.querySelector('.name-entred'),
            formRow = doc.querySelector('.form-row'),
            msgWait = doc.querySelector('.msg-wait'),
            userNameDesignate = doc.querySelector('.user-name-designate');

        //Start user name
        formRow.classList.remove('el-hidden');

        if (localStorage.username) {
            btnRing.removeAttribute('disabled');
            inputUser.classList.add('el-hide');
            nameEntred.classList.remove('el-hide');
            nameEntred.innerHTML = localStorage.username;
        }

        //Set user name
        inputUser.addEventListener('keypress', function(e) {
            if (e.which == 13 && this.value !== '') {
                btnRing.removeAttribute('disabled');
                this.classList.add('el-hide');
                nameEntred.classList.remove('el-hide');
                nameEntred.innerHTML = this.value;
                localStorage.username = this.value;
                this.blur();
            }
        });

        //Enable input name
        nameEntred.addEventListener('click', function(e) {
            btnRing.setAttribute('disabled', 'disabled');
            inputUser.classList.remove('el-hide');
            inputUser.focus();
            this.classList.add('el-hide');
        });

        //ring events
        btnRing.addEventListener('click', function() {
            socket.emit('ring', localStorage.username);
        });

        socket.on('ring', function(msg){
            notifyMe(msg);
            audio.play();
        });

        //go events
        socket.on('go', function(userName){

            userNameDesignate.innerHTML = userName;
            msgWait.classList.remove('el-hide');

            btnRing.setAttribute('disabled', 'disabled');
            
            setTimeout(function (){
                msgWait.classList.add('el-hide');
                btnRing.removeAttribute('disabled');
            }, 10000)
            
            if ("vibrate" in navigator) {
                navigator.vibrate([500, 100, 500]);
            }
            var voyN = new Notification('Go!', {
                icon: conf.iconRing,
                body: userName
            });

            
        });

        if (Notification.permission !== "granted")
        Notification.requestPermission();

    });

    function notifyMe(user) {
        if (!Notification) {
            alert('Desktop notifications not available in your browser. Try Updating Chrome.');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            var notification = new Notification('Ring!', {
                icon: conf.iconRing,
                body: "Hey, I'm " + user + "! Open the door!",
            });

            notification.onclick = function () {
                socket.emit('go', localStorage.username);
            };

        }
    }

})(window, window.document)