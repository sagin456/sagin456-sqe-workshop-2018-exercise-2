import $ from 'jquery';
import {parseCode} from './code-analyzer';

let colors = {
    GREEN: 1,
    RED: 2,
    TRANSPARENT: 3,
};

function getParsedCodeSize(parsedCode){
    let size = 0, key;
    for (key in parsedCode) {
        if (parsedCode.hasOwnProperty(key)) size++;
    }
    return size;
}

function handleColors(parsedCode, ans, i){
    if(parsedCode[i].color === colors.GREEN){
        ans += parsedCode[i].code === '' || parsedCode[i].code.slice(-1) === '\n' ? '<p style=\'background-color:green \'>' +
            parsedCode[i].code.substring(0, parsedCode[i].code.length - 1) + '</p>' + '\n' :
            '<p style=\'background-color:green \'>' + parsedCode[i].code + '</p>' + '\n';
    }
    else if(parsedCode[i].color === colors.RED) {
        ans = handleColors2(parsedCode, ans, i);
    }
    else {
        ans = handleColors3(parsedCode, ans, i);
    }
    return ans;
}

function handleColors2(parsedCode, ans, i){
    ans += parsedCode[i].code === '' || parsedCode[i].code.slice(-1) === '\n' ? '<p style=\'background-color:red \'>' +
        parsedCode[i].code.substring(0, parsedCode[i].code.length - 1) + '</p>' + '\n' :
        '<p style=\'background-color:red \'>' + parsedCode[i].code + '</p>' + '\n';
    return ans;
}

function handleColors3(parsedCode, ans, i){
    ans += parsedCode[i].code === '' || parsedCode[i].code.slice(-1) === '\n' ? '<p>' + parsedCode[i].code.substring(0, parsedCode[i].code.length - 1) + '</p>' + '\n' :
        '<p>' + parsedCode[i].code + '</p>' + '\n';
    return ans;
}


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parametersToParse = $('#argumentsPlaceholder').val();
        let parsedCode = parseCode(codeToParse, parametersToParse);
        let ans ='';
        let length = getParsedCodeSize(parsedCode);

        for(let i=0;i<length;i++){
            parsedCode[i].code = parsedCode[i].code.split(' ');
            parsedCode[i].code = parsedCode[i].code.join('&nbsp&nbsp');
            ans = handleColors(parsedCode, ans, i);
        }
        let table_obj=document.getElementById('yossi');
        table_obj.rows[1].cells[1].innerHTML = ans;
    });
});
