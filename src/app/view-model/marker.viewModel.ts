// just an interface for type safety.
export class Marker {
	id: number;
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
	icon: string;
	isOnline: boolean;
	data: any;
}
