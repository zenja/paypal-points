const N = 12
const rewards = [
    {
        title: "橘子一片",
        img: "img/orange.png",
        chance: 200,
    },
    {
        title: "iPhone X",
        img: "img/iphonex.png",
        chance: 0,
    },
    {
        title: "熊抱",
        img: "img/hug.png",
        chance: 200,
    },
    {
        title: "兰博基尼 10 元优惠券",
        img: "img/lamborghini.png",
        chance: 0,
    },
    {
        title: "iPad Wi-Fi 32GB",
        img: "img/iPad.png",
        chance: 0,
    },
    {
        title: "手纸一张",
        img: "img/tissue.png",
        chance: 800,
    },
    {
        title: "Macbook Pro",
        img: "img/macbookpro.png",
        chance: 1,
    },
    {
        title: "优质茶包一枚",
        img: "img/teabag.png",
        chance: 200,
    },
    {
        title: "白富美一枚",
        img: "img/bfm.png",
        chance: 0,
    },
    {
        title: "白水一杯",
        img: "img/water.png",
        chance: 300,
    },
    {
        title: "药丸",
        img: "img/pill.png",
        chance: 100,
    },
    {
        title: "PayPal Coffee 一杯",
        img: "img/coffee.png",
        chance: 50,
    },
]

const audioRing = new Audio('audio/ring.wav')
const audioCheers = new Audio('audio/cheers.mp3')

function selfCheck() {
    if (rewards.length != N) {
        return false
    } else {
        return true
    }
}

function getDiv(idx) {
    return $('#d' + idx)
}

function activateDiv(idx) {
    let $d = getDiv(idx)
    $d.addClass('active')
}

function deactivateDiv(idx) {
    let $d = getDiv(idx)
    $d.removeClass('active')
}

function preIdx(idx) {
    return (idx - 1) % N
}

// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

var timeout = 0
function ring() {
    deactivateDiv(preIdx(window.nextIdx))
    activateDiv(window.nextIdx % N)
    window.nextIdx++
    window.ringTO = setTimeout(ring, window.timeout)
}

function ringN(n, getMSFunc, onFinish) {
    return function () {
        if (n <= 0) {
            onFinish()
            return
        }
        deactivateDiv(preIdx(window.nextIdx))
        activateDiv(window.nextIdx % N)
        window.nextIdx++
        window.ringTO = setTimeout(ringN(n - 1, getMSFunc, onFinish), getMSFunc(n))
    }
}

function stopRing() {
    clearTimeout(window.ringTO)
}

function getTargetIdx() {
    let all = 0
    for (let i = 0; i < N; i++) {
        all += rewards[i].chance
    }
    console.log("All is " + all)
    let rand = getRandomInt(0, all)
    console.log("Rand is " + rand)
    let target = 7
    let sum = 0
    for (let i = 0; i < N; i++) {
        sum += rewards[i].chance
        if (sum >= rand) {
            target = i
            break
        }
    }
    console.log("Target is " + target)
    return target
}

function finalRings() {
    window.target = getTargetIdx()
    let curr = (window.nextIdx - 1) % N
    let steps = window.target - curr
    if (steps <= 0) {
        steps += N
    }
    initSteps = steps
    let getMSFunc = function (n) {
        return Math.max(130, 1500 * (initSteps - n) / (initSteps * 1.0))
    }
    let onFinish = function () {
        setTimeout(showReward, 1000)
    }
    ringN(steps, getMSFunc, onFinish)()
}

function showReward() {
    let content = "<div id='reward_modal'>"
    content += '<h1>中大奖啦！！&gt;_&lt;</h1>'
    let img = rewards[window.target].img
    content += '<img src="' + img + '">'
    let title = rewards[window.target].title
    content += '<p>' + title + '</p>'
    content += '</div>'

    audioCheers.play()
    picoModal({
        content: content,
        overlayStyles: function (styles) { styles.opacity = 0 },
        modalStyles: function (styles) { styles.opacity = 0 }
    })
        .afterShow(function (modal) {
            $(modal.overlayElem()).animate({ opacity: .5 })
            $(modal.modalElem()).animate({ opacity: 1 })
        })
        .beforeClose(function (modal, event) {
            event.preventDefault()
            deactivateDiv(window.target)
            window.started = false
            $(modal.overlayElem()).add(modal.modalElem())
                .animate(
                { opacity: 0 },
                { complete: modal.forceClose }
                )
        })
        .show()
}

function start() {
    if (window.started) return

    window.started = true
    window.nextIdx = 0

    // ring for a while
    window.timeout = 30
    ring()
    audioRing.play()
    setTimeout(function () {
        window.timeout = 50
        setTimeout(function () {
            window.timeout = 75
            setTimeout(function () {
                window.timeout = 100
                setTimeout(function () {
                    window.timeout = 130
                    setTimeout(function () {
                        stopRing()
                        finalRings()
                    }, 1000)
                }, 1500)
            }, 2400)
        }, 3200)
    }, 3500)
}

function clear() {
    deactivateDiv(window.nextIdx - 1)
    clearTimeout(window.ringTO)
}

function initDivs() {
    for (let i = 0; i < N; i++) {
        let $d = getDiv(i)
        $d.append($('<img src="' + rewards[i].img + '">'))
        $d.append($('<p>' + rewards[i].title + '</p>'))
    }
}

$(function () {
    if (!selfCheck()) {
        alert("Failed to pass self check!")
        return
    }

    initDivs()

    $('#ppp_img').click(function (e) {
        e.preventDefault()
        start()
    })

    $('#clear').click(function (e) {
        e.preventDefault()
        clear()
    })
})