'use client'

import {Suspense} from 'react'
import CreateUserForm from './CreateUserForm'
import Spinner from "@/components/ui/spinner";

export default function CreateUserPage() {
    return (
        <Suspense fallback={<Spinner color="white"/>}>
            <CreateUserForm/>
        </Suspense>
    )
}
