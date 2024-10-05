// utils/numberFormatter.js
export function formatNumberWithUnits(number) {
    if (number >= 1e9) {
        // 十亿以上，保留一位小数
        let num = (number / 1e9).toFixed(1);
        num = num.replace(/\.0$/, ''); // 如果小数部分为 .0，则移除
        return num + 'B';
    } else if (number >= 1e6) {
        // 一百万以上，保留一位小数
        let num = (number / 1e6).toFixed(1);
        num = num.replace(/\.0$/, '');
        return num + 'M';
    } else if (number >= 1e4) {
        // 一万以上，不保留小数
        let num = (number / 1e3).toFixed(0);
        return num + 'K';
    } else if (number >= 1e3) {
        // 一千以上，保留一位小数
        let num = (number / 1e3).toFixed(1);
        num = num.replace(/\.0$/, '');
        return num + 'K';
    } else {
        // 小于一千，不保留小数
        return number.toString();
    }
}

