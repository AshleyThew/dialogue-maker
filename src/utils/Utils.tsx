export {};

export const createLabels = (obj: any, key?: string) =>{
    if(typeof obj === "undefined"){
        return [];
    }
    if(key){
		return Object.values(obj)
			.sort()
			.map((sw) => ({ label: sw[key], value: sw[key] }));
    }else if(Array.isArray(obj)){
        return obj.map((sw) => ({ label: sw, value: sw }));
    }else{
        return Object.keys(obj)
        .sort()
        .map((sw) => ({ label: sw, value: sw }));
    }
}
