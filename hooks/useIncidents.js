import { useContext } from "react";
import {IncidentsContext} from "../contexts/IncidentsContext";

export function useIncidents() {
    const context = useContext(IncidentsContext);

    if(!context){
        throw new Error("useIncidents must be used within an IncidentsProvider");
    }

    return context
}
