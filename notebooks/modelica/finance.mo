model finance
    parameter Real interest_rate=0.025;
    parameter Real salary_increase=0.02;
    parameter Real initial_amortization_rate=0.025;
    parameter Real amortization_factor=0.35;
    parameter Real total_years=20;
    
    Real amortization_rate(unit="euro/year");
    Real amortization_total(unit="euro");
    Real debt(unit="euro");
    Real capital(unit="euro", start=300000);
    Real salary(unit="euro", start=100000);
    Real amortization_percentage;
    
    Real debt_cost_yearly(unit="euro");
    Real debt_cost_total(unit="euro");
    Real debt_cost_percentage(unit="euro");
    Real assets(unit="euro");
initial equation
   amortization_rate = salary * amortization_factor;
   debt = amortization_rate / (interest_rate + initial_amortization_rate);
equation
   der(amortization_rate) = 0;
   assets = capital + debt;
   debt_cost_yearly = debt*log(1 + interest_rate);
   amortization_percentage = if debt_cost_yearly > 1 then (amortization_rate/salary) else 0;
   debt_cost_percentage = debt_cost_yearly / amortization_rate;

   der(amortization_total) = if debt > 0 then amortization_rate else 0;
   der(debt_cost_total) = debt_cost_yearly;
   der(capital) = (amortization_rate - debt_cost_yearly);
   der(debt) = if debt > 0 then -(amortization_rate - debt_cost_yearly) else 0;
   der(salary) = salary*log(1 + salary_increase);
end finance;