model softwareconsultancy
    Real projects_market(unit="Project", start=50);
    parameter Real qualification_rate = 0.3;
    parameter Real closing_rate = 0.5;
    parameter Real accomplishment_rate = 0.8;
    parameter Real request_rate(unit="1/Karma") = 1;
    Real reputation(unit="Karma", start=0.1);
    Real projects_requested(unit="Project", start=0);
    Real projects_qualified(unit="Project", start=0);
    Real projects_signed(unit="Project", start=0);
    Real projects_running(unit="Project", start=0);
    Real projects_accomplished(unit="Project", start=0);
equation
    der(projects_market) = -der(projects_accomplished);
    der(projects_requested) = max(projects_market, 0) * (min(reputation, 1) * request_rate);
    der(projects_qualified) = der(projects_requested) * qualification_rate;
    der(projects_signed) = der(projects_qualified) * closing_rate;
    der(projects_running) = der(projects_signed) - der(projects_accomplished);
    //der(projects_running) = 0;
    der(projects_accomplished) = delay(projects_running * accomplishment_rate, 1);
    der(reputation) = der(projects_accomplished);
end softwareconsultancy;