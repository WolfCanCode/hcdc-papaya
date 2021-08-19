const utils = {
    distinct: (arrays) => arrays.filter((value, index, self) =>
        self.indexOf(value) === index)
}

export default utils