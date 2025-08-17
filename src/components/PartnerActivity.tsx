'use client';

import Matchup from "@/components/Matchup";
import {ParticipantUser} from "@/types/models";

interface User {
    name: string | null | undefined;
    icon: string | null | undefined;
    description: string | null | undefined;
}

interface PartnerActivityProps {
    shouldRender: boolean;
    currentUser: User | null;
    partner: ParticipantUser | null;
}

export default function PartnerActivity({ shouldRender, currentUser, partner }: PartnerActivityProps) {
    if (!shouldRender || !currentUser || !partner) return null;

    return (
        <Matchup
            user1={{
                name: currentUser.name,
                avatar: currentUser.icon,
                description: currentUser.description
            }}
            user2={{
                name: partner.name,
                avatar: partner.icon,
                description: partner.description
            }}
        />
    );
}
