
import React from 'react';
import { Link } from 'react-router-dom';
import { Icons, APP_NAME } from '../constants';

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; linkTo: string }> = ({ title, description, icon, linkTo }) => (
  <Link to={linkTo} className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
    <div className="flex items-center text-primary mb-3">
      {icon}
      <h3 className="text-xl font-semibold ml-3">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm">{description}</p>
  </Link>
);

const HomePage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <header className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-16 px-6 rounded-lg shadow-xl mb-12 text-center">
        <div className="container mx-auto">
          <Icons.Sparkles className="w-24 h-24 mx-auto mb-6 text-white" />
          <h1 className="text-5xl font-bold mb-4">{APP_NAME}</h1>
          <p className="text-xl font-light mb-8 max-w-2xl mx-auto">
            Your intelligent partner for personalized nutrition and effortless meal planning. Achieve your health goals with AI-powered insights.
          </p>
          <Link
            to="/profiles"
            className="bg-white text-primary font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 text-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-dark text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="User Profiles" 
            description="Create detailed profiles for personalized meal plans and advice." 
            icon={<Icons.User className="w-8 h-8" />}
            linkTo="/profiles"
          />
          <FeatureCard 
            title="AI Meal Planner" 
            description="Generate weekly meal plans tailored to your needs and preferences." 
            icon={<Icons.Calendar className="w-8 h-8" />}
            linkTo="/meal-planner"
          />
          <FeatureCard 
            title="AI Diet Coach" 
            description="Ask questions and get nutritional guidance from our smart AI." 
            icon={<Icons.Sparkles className="w-8 h-8" />}
            linkTo="/ai-coach"
          />
          <FeatureCard 
            title="Protein Guide" 
            description="Discover the best protein sources for your diet and goals." 
            icon={<Icons.Protein className="w-8 h-8" />}
            linkTo="/protein-guide"
          />
          <FeatureCard 
            title="Baby Zone" 
            description="Specialized guidance for infant and toddler nutrition." 
            icon={<Icons.Baby className="w-8 h-8" />}
            linkTo="/baby-zone"
          />
          <FeatureCard 
            title="Grocery Lists" 
            description="Automatically generate grocery lists from your meal plans." 
            icon={<Icons.Grocery className="w-8 h-8" />}
            linkTo="/grocery-list"
          />
        </div>
      </section>

      <section className="bg-secondary text-white py-16 px-6 rounded-lg shadow-xl my-12 text-center">
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Nutrition?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
                Join {APP_NAME} today and take the first step towards a healthier, more organized lifestyle.
            </p>
            <Link
              to="/meal-planner"
              className="bg-primary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300 text-lg"
            >
              Plan Your Meals
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
