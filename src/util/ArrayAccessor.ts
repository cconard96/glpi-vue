export class ArrayAccessor {
    getByPath(obj: Object, path: string): any {
        return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
    }
    setByPath(obj: Object, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((o, p) => {
            if (!o[p]) o[p] = {};
            return o[p];
        }, obj);
        if (lastKey) lastObj[lastKey] = value;
    }
    hasPath(obj: Object, path: string): boolean {
        return this.getByPath(obj, path) !== undefined;
    }
}