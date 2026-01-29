export class ArrayAccessor {
    getByPath(obj, path) {
        return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
    }
    setByPath(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((o, p) => {
            if (!o[p]) o[p] = {};
            return o[p];
        }, obj);
        if (lastKey) lastObj[lastKey] = value;
    }
    hasPath(obj, path) {
        return this.getByPath(obj, path) !== undefined;
    }
}