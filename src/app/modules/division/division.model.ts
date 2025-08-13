import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";


const divisionSchema = new Schema<IDivision>({
    name: { type: String, unique: true, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String },
    description: { type: String }
}, {
    timestamps: true,
    versionKey: false
})

export const Division = model<IDivision>("Division", divisionSchema)